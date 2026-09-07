from django.conf import settings
from django.db import models


def resume_upload_path(instance, filename):
    return f"resumes/user_{instance.user_id}/{filename}"


class Resume(models.Model):
    FILE_TYPE_CHOICES = (
        ('pdf', 'PDF'),
        ('docx', 'DOCX'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=resume_upload_path)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    extracted_text = models.TextField(blank=True, null=True)
    ats_score = models.FloatField(null=True, blank=True)
    parsed_name = models.CharField(max_length=255, blank=True, null=True)
    parsed_email = models.EmailField(blank=True, null=True)
    parsed_phone = models.CharField(max_length=30, blank=True, null=True)
    is_processed = models.BooleanField(default=False)
    processing_error = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.title} ({self.user.email})"


class Skill(models.Model):
    CATEGORY_CHOICES = (
        ('language', 'Programming Language'),
        ('framework', 'Framework'),
        ('database', 'Database'),
        ('tool', 'Tool'),
        ('cloud', 'Cloud'),
        ('soft_skill', 'Soft Skill'),
        ('other', 'Other'),
    )

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ResumeSkill(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='resume_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='resume_links')
    confidence_score = models.FloatField(default=1.0)

    class Meta:
        unique_together = ('resume', 'skill')

    def __str__(self):
        return f"{self.resume.title} - {self.skill.name}"


class Education(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='education')
    degree = models.CharField(max_length=255)
    institution = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.degree} @ {self.institution}"


class Experience(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='experience')
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.position} @ {self.company}"


class Project(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    technologies = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.name


class Certification(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255, blank=True, null=True)
    issue_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.name
