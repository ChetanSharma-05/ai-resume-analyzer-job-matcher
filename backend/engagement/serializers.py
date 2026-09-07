from rest_framework import serializers

from jobs.serializers import JobDetailSerializer, JobListSerializer
from .models import Interview, Notification, Recommendation, SavedJob


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(source='job', queryset=SavedJob._meta.get_field('job').remote_field.model.objects.all(), write_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'job_id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'kind', 'link', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


class InterviewSerializer(serializers.ModelSerializer):
    application_id = serializers.PrimaryKeyRelatedField(source='application', queryset=Interview._meta.get_field('application').remote_field.model.objects.all(), write_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    candidate_name = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = ['id', 'application_id', 'job_title', 'candidate_name', 'scheduled_at', 'interview_type', 'meeting_link', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_candidate_name(self, obj):
        return obj.application.candidate.get_full_name() or obj.application.candidate.username


class RecommendationSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'job', 'score', 'reason', 'created_at']
