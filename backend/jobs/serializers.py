from rest_framework import serializers
from .models import Job, JobSkill
from resumes.serializers import SkillSerializer
from resumes.models import Skill


class JobSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_name = serializers.CharField(write_only=True)

    class Meta:
        model = JobSkill
        fields = ['id', 'skill', 'skill_name', 'required', 'importance']

    def create(self, validated_data):
        skill_name = validated_data.pop('skill_name')
        skill_obj, _ = Skill.objects.get_or_create(name=skill_name)
        return JobSkill.objects.create(skill=skill_obj, **validated_data)


class JobListSerializer(serializers.ModelSerializer):
    application_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'employment_type',
            'experience_required', 'salary', 'created_at',
            'status', 'application_count',
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    job_skills = JobSkillSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'description', 'location', 'employment_type',
            'experience_required', 'salary', 'created_at', 'updated_at', 'job_skills',
            'responsibilities', 'education_requirements', 'status', 'recruiter',
        ]


class JobWriteSerializer(serializers.ModelSerializer):
    """Used for create/update by admins. Skills are managed via a separate nested endpoint
    to keep this serializer simple and avoid deeply nested writable serializers."""

    recruiter = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'description', 'location', 'employment_type',
            'experience_required', 'salary',
            'responsibilities', 'education_requirements', 'status',
            'required_skills', 'preferred_skills',
            'recruiter',
        ]

    required_skills = serializers.CharField(required=False, write_only=True, allow_blank=True)
    preferred_skills = serializers.CharField(required=False, write_only=True, allow_blank=True)

    def create(self, validated_data):
        required = validated_data.pop('required_skills', '')
        preferred = validated_data.pop('preferred_skills', '')
        job = Job.objects.create(**validated_data)
        self._save_skills(job, required, True)
        self._save_skills(job, preferred, False)
        return job

    def update(self, instance, validated_data):
        required = validated_data.pop('required_skills', None)
        preferred = validated_data.pop('preferred_skills', None)
        instance = super().update(instance, validated_data)
        if required is not None or preferred is not None:
            instance.job_skills.all().delete()
            self._save_skills(instance, required or '', True)
            self._save_skills(instance, preferred or '', False)
        return instance

    def _save_skills(self, job, raw_skills, required):
        for raw_name in raw_skills.split(','):
            name = raw_name.strip()
            if name:
                skill, _ = Skill.objects.get_or_create(name=name)
                JobSkill.objects.create(job=job, skill=skill, required=required, importance='high' if required else 'medium')
