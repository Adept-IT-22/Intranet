import jwt
import datetime
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from chat.models import ChatMessage
import csv
import io
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings


User = get_user_model()

@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username & password required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_active = False  # Account must be approved before login
    user.save()
    return Response({"message": "User created successfully. Please wait for admin approval.", "username": user.username})

@api_view(["GET"])
def generate_sso_token(request):
    """
    Generates a short-lived SSO token for hand-off to Ideahub.
    Signed with a Shared Secret that both apps know.
    """
    if not settings.SSO_SHARED_SECRET:
        return Response({"error": "SSO not configured on server"}, status=500)

    user = request.user
    
    payload = {
        "email": user.email,
        "sub": str(user.id),
        "name": user.username,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=5), 
        "iss": settings.SSO_ISSUER,
        "aud": settings.SSO_AUDIENCE,
    }

    try:
        secret_bytes = bytes.fromhex(settings.SSO_SHARED_SECRET)
        token = jwt.encode(payload, secret_bytes, algorithm="HS256")
        return Response({"token": token})
    except Exception as e:
        return Response({"error": f"Token generation failed: {str(e)}"}, status=500)

@api_view(["GET"])
@permission_classes([AllowAny])
def root_view(request):
    return Response({"message": "Welcome to the API root ✅"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    # Instead of just a role string, we provide specific capabilities
    # This prevents hardcoding "admin" strings on the frontend
    is_admin_user = (user.role == "admin" or user.is_superuser)
    
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": "admin" if is_admin_user else user.role,
        "avatar": user.avatar.url if user.avatar else None,
        "capabilities": {
            "can_post_announcements": is_admin_user or user.has_perm('announcements.add_announcement'),
            "can_delete_announcements": is_admin_user or user.has_perm('announcements.delete_announcement'),
        }
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history(request, username):
    other_user = get_object_or_404(User, username=username)

    # Fetch messages between current user & other_user
    messages = ChatMessage.objects.filter(
        Q(sender=request.user, receiver=other_user) |
        Q(sender=other_user, receiver=request.user)
    ).order_by("timestamp")

    return Response([
        {
            "id": msg.id,
            "sender": msg.sender.username,
            "receiver": msg.receiver.username,
            "content": msg.message,  # ✅ Use 'message' field from ChatMessage model
            "timestamp": msg.timestamp,
        }
        for msg in messages
    ])

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_as_read(request, username):
    other_user = get_object_or_404(User, username=username)

    # Note: Your ChatMessage model doesn't have is_read field yet
    # You'll need to add it if you want this functionality
    # ChatMessage.objects.filter(
    #     sender=other_user,
    #     receiver=request.user,
    #     is_read=False
    # ).update(is_read=True)

    return Response({"message": f"Marked messages from {username} as read ✅"})


# Admin User Management APIs
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_list(request):
    if request.user.role != "admin" and not request.user.is_superuser:
        return Response({"error": "Admin access required"}, status=403)
    
    users = User.objects.all().order_by('username')
    return Response([
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser
        }
        for user in users
    ])

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_role(request, user_id):
    if request.user.role != "admin" and not request.user.is_superuser:
        return Response({"error": "Admin access required"}, status=403)
    
    user = get_object_or_404(User, id=user_id)
    role = request.data.get("role")
    if role in ["admin", "employee", "manager"]:
        user.role = role
        user.save()
        return Response({"message": f"User {user.username} updated to {role}"})
    return Response({"error": "Invalid role"}, status=400)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def toggle_user_status(request, user_id):
    if request.user.role != "admin" and not request.user.is_superuser:
        return Response({"error": "Admin access required"}, status=403)
    
    user = get_object_or_404(User, id=user_id)
    if user.is_superuser:
        return Response({"error": "Cannot deactivate superusers"}, status=400)
        
    user.is_active = not user.is_active
    user.save()
    status_str = "activated" if user.is_active else "deactivated"
    return Response({"message": f"User {user.username} has been {status_str} ✅"})

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    if request.user.role != "admin" and not request.user.is_superuser:
        return Response({"error": "Admin access required"}, status=403)
    
    user = get_object_or_404(User, id=user_id)
    if user.is_superuser:
        return Response({"error": "Cannot delete superusers"}, status=400)
    
    username = user.username
    user.delete()
    return Response({"message": f"User {username} deleted successfully"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employee_list(request):
    employees = User.objects.all().order_by('username')
    return Response([
        {
            "id": emp.id,
            "name": emp.username,
            "role": emp.role or "Employee",
            "department": emp.department or "General",
            "email": emp.email,
            "photo": emp.avatar.url if emp.avatar else None,
        }
        for emp in employees
    ])

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_employees_csv(request):
    if request.user.role != "admin" and not request.user.is_superuser:
        return Response({"error": "Admin access required"}, status=403)
    
    csv_file = request.FILES.get("file")
    overwrite = request.data.get("overwrite") == "true"
    
    if not csv_file:
        return Response({"error": "No file uploaded"}, status=400)
    
    try:
        decoded_file = csv_file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        created_count = 0
        updated_count = 0
        skipped_count = 0
        
        for row in reader:
            username = row.get("username", "").strip()
            email = row.get("email", "").strip()
            role = row.get("role", "employee").strip().lower()
            department = row.get("department", "").strip()
            team = row.get("team", "").strip()
            
            if not username or not email:
                continue
                
            user_exists = User.objects.filter(username=username).first()
            
            if not user_exists:
                user = User.objects.create(
                    username=username,
                    email=email,
                    role=role,
                    department=department,
                    team=team
                )
                user.set_password("Adept123!") # Default password
                user.save()
                created_count += 1
            elif overwrite:
                user_exists.email = email
                user_exists.role = role
                user_exists.department = department
                user_exists.team = team
                user_exists.save()
                updated_count += 1
            else:
                skipped_count += 1
                
        return Response({
            "message": f"CSV processing complete.",
            "created": created_count,
            "updated": updated_count,
            "skipped": skipped_count
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_avatar(request):
    user = request.user
    avatar_file = request.FILES.get("avatar")
    
    if not avatar_file:
        return Response({"error": "No image uploaded"}, status=400)
        
    user.avatar = avatar_file
    user.save()
    
    return Response({
        "message": "Avatar updated successfully",
        "avatar_url": user.avatar.url
    })

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_avatar(request, user_id):
    # Only self or Admin can remove
    if request.user.id != user_id and request.user.role != "admin" and not request.user.is_superuser:
        return Response({"error": "Permission denied"}, status=400)
        
    target_user = get_object_or_404(User, id=user_id)
    if target_user.avatar:
        target_user.avatar.delete()
        target_user.save()
        
    return Response({"message": "Avatar removed"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_reset_user_password(request, user_id):
    if request.user.role != "admin" and not request.user.is_superuser:
        return Response({"error": "Admin access required"}, status=403)
    
    user = get_object_or_404(User, id=user_id)
    
    if not user.email:
        return Response({"error": "User does not have an email address configured."}, status=400)

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    frontend_url = request.META.get('HTTP_ORIGIN', 'http://localhost:5173')
    reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"
    
    try:
        send_mail(
            subject="Password Reset Request",
            message=f"Hello {user.username},\n\nAn administrator has requested a password reset for your account. Please click the link below to set a new password:\n\n{reset_link}\n\nIf you did not request this, please contact IT immediately.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return Response({"message": f"Password reset email sent to {user.email}"})
    except Exception as e:
        return Response({"error": f"Failed to send email: {str(e)}"}, status=500)

@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    uidb64 = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("new_password")
    
    if not uidb64 or not token or not new_password:
        return Response({"error": "Missing uid, token, or new_password"}, status=400)
        
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
        
    if user is not None and default_token_generator.check_token(user, token):
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password has been reset successfully."})
    else:
        return Response({"error": "Invalid or expired token."}, status=400)


