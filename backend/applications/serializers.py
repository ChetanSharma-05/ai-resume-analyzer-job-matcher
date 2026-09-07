from rest_framework import serializers

from jobs.serializers import JobListSerializer
from resumes.serializers import ResumeListSerializer, ResumeDetailSerializer
from .models import Application, ApplicationHistory


class ApplicationHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationHistory
        fields = ['id', 'status', 'comment', 'changed_by_name', 'created_at']

    def get_changed_by_name(self, obj):
        return obj.changed_by.get_full_name() if obj.changed_by else 'System'


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    resume = ResumeListSerializer(read_only=True)
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.EmailField(source='candidate.email', read_only=True)
    candidate_headline = serializers.CharField(source='candidate.headline', read_only=True)
    candidate_bio = serializers.CharField(source='candidate.bio', read_only=True)
    resume_download_url = serializers.SerializerMethodField()
    history = ApplicationHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'resume', 'candidate_name', 'candidate_email', 'candidate_headline', 'candidate_bio',
            'phone', 'location', 'portfolio_url', 'notice_period', 'resume_download_url', 'cover_letter',
            'status', 'ats_score', 'skill_match_score', 'semantic_score', 'match_score',
            'matched_skills', 'missing_skills', 'applied_at', 'updated_at', 'history',
        ]

    def get_candidate_name(self, obj):
        return obj.candidate.get_full_name() or obj.candidate.username

    def get_resume_download_url(self, obj):
        request = self.context.get('request')
        if not obj.resume or not obj.resume.file:
            return None
        url = f'/api/applications/{obj.pk}/resume/'
        return request.build_absolute_uri(url) if request else url


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['job', 'resume', 'phone', 'location', 'portfolio_url', 'notice_period', 'cover_letter']

    def validate_resume(self, resume):
        request = self.context['request']
        if resume.user_id != request.user.id:
            raise serializers.ValidationError('You can only apply with your own resume.')
        if not resume.is_processed:
            raise serializers.ValidationError('Please wait for resume analysis to finish before applying.')
        return resume

    def validate(self, attrs):
        request = self.context['request']
        if attrs['job'].status != 'published':
            raise serializers.ValidationError({'job': 'This job is not accepting applications.'})
        if Application.objects.filter(candidate=request.user, job=attrs['job']).exists():
            raise serializers.ValidationError({'job': 'You have already applied for this job.'})
        return attrs


class ApplicationStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[choice[0] for choice in Application.STATUS_CHOICES])
    comment = serializers.CharField(required=False, allow_blank=True)
