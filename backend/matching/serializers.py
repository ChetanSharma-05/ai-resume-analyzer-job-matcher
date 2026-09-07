from rest_framework import serializers
from .models import MatchResult
from jobs.serializers import JobListSerializer
from resumes.serializers import ResumeListSerializer


class MatchResultSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)

    class Meta:
        model = MatchResult
        fields = [
            'id', 'job', 'match_score', 'skill_score', 'semantic_score',
            'matched_skills', 'missing_skills', 'created_at',
        ]


class MatchResultDetailSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    resume = ResumeListSerializer(read_only=True)

    class Meta:
        model = MatchResult
        fields = [
            'id', 'resume', 'job', 'match_score', 'skill_score', 'semantic_score',
            'matched_skills', 'missing_skills', 'created_at',
        ]
