from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import RecruiterProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=[('user', 'Candidate'), ('recruiter', 'Recruiter')], default='user', write_only=True)
    company_name = serializers.CharField(required=False, write_only=True)
    company_website = serializers.URLField(required=False, allow_blank=True, write_only=True)
    company_description = serializers.CharField(required=False, allow_blank=True, write_only=True)
    company_location = serializers.CharField(required=False, allow_blank=True, write_only=True)
    industry = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'company_name', 'company_website', 'company_description', 'company_location', 'industry']

    def validate(self, attrs):
        if attrs.get('role') == 'recruiter' and not attrs.get('company_name'):
            raise serializers.ValidationError({'company_name': 'Company name is required for recruiters.'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.pop('role', 'user')
        company_data = {key: validated_data.pop(key, '') for key in ('company_name', 'company_website', 'company_description', 'company_location', 'industry')}
        user = User(**validated_data)
        user.set_password(password)  # hashes the password, never store raw text
        user.role = role
        user.save()
        if role == 'recruiter':
            RecruiterProfile.objects.create(user=user, **company_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'headline', 'bio', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'role', 'created_at']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = ['id', 'company_name', 'company_website', 'company_description', 'company_location', 'industry', 'company_size', 'logo', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Adds extra user info (role, name) directly into the JWT payload,
    so the frontend can read the role without an extra API call.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
        }
        return data
