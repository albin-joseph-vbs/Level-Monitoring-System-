from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)


# ─── POST /api/login/ ─────────────────────────────────────────────────────────
class LoginView(TokenObtainPairView):
    """
    Accepts: { "username": "...", "password": "..." }
    Returns: { "success": true, "message": "...", "access": "<JWT>", "refresh": "<JWT>", "user": {...} }
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {"success": False, "message": "Invalid username or password. Please try again."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


# ─── POST /api/register/ ──────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Accepts: { "name": "...", "email": "...", "username": "...", "password": "..." }
    Returns: { "success": true, "message": "..." }
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {
                "success": True,
                "message": f"Account created successfully! Welcome, {user.first_name}. You can now log in.",
            },
            status=status.HTTP_201_CREATED,
        )
    # Flatten the first error message for the frontend
    errors = serializer.errors
    first_field = next(iter(errors))
    first_msg   = errors[first_field][0] if errors[first_field] else "Validation error."
    return Response(
        {"success": False, "message": str(first_msg)},
        status=status.HTTP_400_BAD_REQUEST,
    )


# ─── POST /api/forgot-password/ ───────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    """
    Accepts: { "email": "..." }
    Returns: { "success": true, "message": "..." }
    NOTE: Always returns success to prevent user enumeration attacks.
    In production, send a real password-reset email here.
    """
    email = request.data.get('email', '').strip()
    if not email:
        return Response(
            {"success": False, "message": "Email address is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # In production: look up the user and send a reset email via Django's
    # built-in password reset mechanism or a service like SendGrid.
    # For now, we always respond positively (security best practice).
    # Example production code:
    #   user = User.objects.filter(email=email).first()
    #   if user:
    #       send_password_reset_email(user)

    return Response(
        {
            "success": True,
            "message": f"If {email} is registered, a password reset link has been sent to your inbox.",
        },
        status=status.HTTP_200_OK,
    )


# ─── POST /api/logout/ ────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Accepts: { "refresh": "<refresh_token>" }
    Blacklists the refresh token so it can no longer be used.
    """
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {"success": True, "message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )
    except Exception:
        return Response(
            {"success": False, "message": "Invalid or expired token."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ─── GET /api/me/ ─────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Returns the currently logged-in user's info.
    Frontend sends: Authorization: Bearer <access_token>
    """
    serializer = UserSerializer(request.user)
    return Response(
        {"success": True, "user": serializer.data},
        status=status.HTTP_200_OK,
    )


# ─── GET /api/health/ ─────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def health_view(request):
    """Simple health check — use to verify the server is running."""
    return Response(
        {"status": "ok", "service": "LinkNL Technologies API"},
        status=status.HTTP_200_OK,
    )