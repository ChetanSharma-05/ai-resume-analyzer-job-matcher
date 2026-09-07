from rest_framework import serializers
from .models import Resume, ResumeSkill, Skill, Education, Experience, Project, Certification


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']


class ResumeSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)

    class Meta:
        model = ResumeSkill
        fields = ['id', 'skill', 'confidence_score']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'degree', 'institution', 'field_of_study', 'start_date', 'end_date']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'company', 'position', 'description', 'start_date', 'end_date']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'technologies']


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuer', 'issue_date']


class ResumeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'title', 'file_type', 'ats_score', 'is_processed', 'created_at']


class ResumeDetailSerializer(serializers.ModelSerializer):
    resume_skills = ResumeSkillSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = [
            'id', 'title', 'file', 'file_type', 'extracted_text', 'ats_score',
            'parsed_name', 'parsed_email', 'parsed_phone', 'is_processed',
            'processing_error', 'created_at', 'updated_at',
            'resume_skills', 'education', 'experience', 'projects', 'certifications',
        ]
        read_only_fields = [
            'extracted_text', 'ats_score', 'parsed_name', 'parsed_email',
            'parsed_phone', 'is_processed', 'processing_error',
        ]


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'title', 'file']
