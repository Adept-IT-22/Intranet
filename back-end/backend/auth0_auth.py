import json
import jwt
import logging
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

logger = logging.getLogger(__name__)
User = get_user_model()


# Simple in-memory cache for JWKS to avoid network calls on every request
_JWKS_CACHE = None

class Auth0Authentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        global _JWKS_CACHE
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        parts = auth_header.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            return None

        token = parts[1]
        logger.debug('[Auth0] Validating token...')

        try:
            if _JWKS_CACHE is None:
                jwks_url = f'https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json'
                logger.info(f'[Auth0] Refreshing JWKS cache from: {jwks_url}')
                _JWKS_CACHE = requests.get(jwks_url).json()
            
            jwks = _JWKS_CACHE
            unverified_header = jwt.get_unverified_header(token)

            rsa_key = {}
            for key in jwks['keys']:
                if key['kid'] == unverified_header['kid']:
                    rsa_key = {
                        'kty': key['kty'], 'kid': key['kid'], 'use': key['use'],
                        'n': key['n'], 'e': key['e']
                    }

            if not rsa_key:
                # If key not found, try clearing cache and refetching once
                logger.info('[Auth0] Key ID not in cache. Refetching JWKS...')
                jwks_url = f'https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json'
                _JWKS_CACHE = requests.get(jwks_url).json()
                jwks = _JWKS_CACHE
                for key in jwks['keys']:
                    if key['kid'] == unverified_header['kid']:
                        rsa_key = {'kty': key['kty'], 'kid': key['kid'], 'use': key['use'], 'n': key['n'], 'e': key['e']}

            if rsa_key:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(rsa_key))
                payload = jwt.decode(
                    token, public_key, algorithms=['RS256'],
                    audience=settings.AUTH0_AUDIENCE,
                    issuer=f'https://{settings.AUTH0_DOMAIN}/'
                )
            else:
                raise exceptions.AuthenticationFailed('Unable to find appropriate key')

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except Exception as e:
            logger.error(f'[Auth0] Auth error: {e}')
            raise exceptions.AuthenticationFailed(str(e))

        auth0_id = payload['sub']
        
        # resolve email by checking token claims first
        email = (
            payload.get('email') or 
            payload.get(f'{settings.AUTH0_AUDIENCE}/email') or
            payload.get('https://adept.api/email') or
            ''
        )

        # Fallback to /userinfo ONLY if email is missing from token (Slowest)
        if not email:
            try:
                userinfo_url = f'https://{settings.AUTH0_DOMAIN}/userinfo'
                logger.info(f'[Auth0] Email missing from token. Fetching from /userinfo...')
                userinfo_resp = requests.get(
                    userinfo_url,
                    headers={'Authorization': f'Bearer {token}'},
                    timeout=3
                )
                if userinfo_resp.status_code == 200:
                    email = userinfo_resp.json().get('email', '')
            except Exception as e:
                logger.error(f'[Auth0] /userinfo fallback failed: {e}')

        logger.debug(f'[Auth0] Identity resolved: {email or auth0_id}')
        
        ROLES_NAMESPACE = 'https://adept.api'
        auth0_roles = payload.get(f'{ROLES_NAMESPACE}/roles', [])
        is_auth0_admin = 'admin' in auth0_roles
        logger.info(f'[Auth0] Roles from token: {auth0_roles} | is_auth0_admin={is_auth0_admin}')

        user = None

        # Match by email - bridges old manual accounts with Auth0
        if email:
            user = User.objects.filter(email=email).first()
            if user:
                logger.info(f'[Auth0] Found user by email: {user.username} | is_active={user.is_active}')
            else:
                logger.info(f'[Auth0] No user found with email: {email}')

        # Step 2: Match by Auth0 ID
        if not user:
            user = User.objects.filter(username=auth0_id).first()
            if user:
                logger.info(f'[Auth0] Found user by Auth0 ID: {user.username} | is_active={user.is_active}')

        # Create new user - auto-activate if they are an Auth0 admin, else pending
        if not user:
            logger.info(f'[Auth0] No existing user found. Creating account for {email} | auto_activate={is_auth0_admin}')
            
            # Generate a friendly username from the email prefix
            base_username = email.split('@')[0] if email else "user"
            friendly_username = base_username
            
            # Ensure uniqueness (if "john" exists, try "john_1", "john_2" etc.)
            counter = 1
            while User.objects.filter(username=friendly_username).exists():
                friendly_username = f"{base_username}_{counter}"
                counter += 1

            user = User.objects.create(
                username=friendly_username,
                email=email,
                is_active=is_auth0_admin,      # Admins get in immediately
                role='admin' if is_auth0_admin else None,
            )
            logger.info(f'[Auth0] Created new user: {user.username} (ID: {user.id}) | is_active={user.is_active}')

        # If user already exists but was created before Auth0 role sync —
        # promote them now if Auth0 says they're admin
        elif is_auth0_admin and (not user.is_active or user.role != 'admin'):
            logger.info(f'[Auth0] Promoting existing user {user.username} to admin based on Auth0 role.')
            user.is_active = True
            user.role = 'admin'
            user.save()

        # admin approval gate
        logger.info(f'[Auth0] Final user: {user.username} | is_active={user.is_active}')
        if not user.is_active:
            logger.warning(f'[Auth0] BLOCKED — user {user.username} is not yet approved by admin.')
            raise exceptions.PermissionDenied('Your account is pending administrator approval.')

        logger.info(f'[Auth0] SUCCESS — user {user.username} authenticated.')
        return (user, None)
