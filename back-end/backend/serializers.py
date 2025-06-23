# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    login = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['login'], password=data['password'])
        if not user:
            # Try login by email
            try:
                user = CustomUser.objects.get(email=data['login'])
                user = authenticate(username=user.username, password=data['password'])
            except CustomUser.DoesNotExist:
                pass
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        refresh = RefreshToken.for_user(user)
        return {
            'token': str(refresh.access_token),
            'username': user.username,
            'email': user.email
        }
