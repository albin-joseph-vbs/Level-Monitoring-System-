from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# ─── Custom JWT payload ───────────────────────────────────────────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default JWT login serializer.
    Adds user info + success/message fields to the token response.
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        data['success'] = True
        data['message'] = f'Welcome back, {self.user.username}!'
        data['user'] = {
            'id':       self.user.id,
            'username': self.user.username,
            'email':    self.user.email,
            'name':         self.user.get_full_name() or self.user.username,
            'is_superuser': self.user.is_superuser,
            'is_staff':     self.user.is_staff,
            'role':         'admin' if self.user.is_superuser else 'operator',
        }
        return data


# ─── Register ─────────────────────────────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    """Validates and creates a new user."""

    name     = serializers.CharField(required=True, write_only=True, max_length=150)
    password = serializers.CharField(required=True, write_only=True, validators=[validate_password])

    class Meta:
        model  = User
        fields = ('username', 'email', 'password', 'name')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        name = validated_data.pop('name')
        user = User.objects.create_user(
            username   = validated_data['username'],
            email      = validated_data['email'],
            password   = validated_data['password'],
            first_name = name,
        )
        return user


# ─── User info (read-only) ────────────────────────────────────────────────────
class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'name')

    def get_name(self, obj):
        return obj.get_full_name() or obj.username