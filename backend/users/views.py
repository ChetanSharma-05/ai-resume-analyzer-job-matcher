from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from .serializers import RegisterSerializer, UserProfileSerializer, RecruiterProfileSerializer, CustomTokenObtainPairSerializer
from .models import RecruiterProfile
from common.utilities import success_response


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success_response(
            data={'id': user.id, 'email': user.email},
            message="Account created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — returns access + refresh tokens."""
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the refresh token so it can no longer be used to get new access tokens.
    Requires rest_framework_simplejwt.token_blacklist app for full effect;
    here we simply validate the token was provided (stateless fallback).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token is required.", "errors": {}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            # If blacklist app isn't enabled, we still tell the client to discard tokens locally
            pass
        return success_response(message="Logged out successfully.")


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class RecruiterCompanyView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RecruiterProfileSerializer

    def get_object(self):
        if self.request.user.role != 'recruiter':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only recruiters can manage a company profile.')
        profile, _ = RecruiterProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'company_name': f"{self.request.user.get_full_name() or self.request.user.username}'s Company"},
        )
        return profile


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        user = UserProfileSerializer.Meta.model.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            send_mail('ResumeAI password reset', f'Use this reset path: /reset-password?uid={uid}&token={token}', 'no-reply@resumeai.local', [user.email], fail_silently=True)
        return success_response(message='If this email is registered, reset instructions have been sent.')


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            user_id = force_str(urlsafe_base64_decode(request.data.get('uid', '')))
            user = UserProfileSerializer.Meta.model.objects.get(pk=user_id)
        except Exception:
            return Response({'success': False, 'message': 'Invalid reset link.', 'errors': {}}, status=400)
        token = request.data.get('token', '')
        password = request.data.get('password', '')
        if not default_token_generator.check_token(user, token):
            return Response({'success': False, 'message': 'This reset link is invalid or expired.', 'errors': {}}, status=400)
        if len(password) < 8:
            return Response({'success': False, 'message': 'Password must be at least 8 characters.', 'errors': {}}, status=400)
        user.set_password(password)
        user.save(update_fields=['password'])
        return success_response(message='Password updated successfully.')
