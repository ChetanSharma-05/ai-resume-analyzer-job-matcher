from django.db import models
from resumes.models import Skill
from users.models import User


class Job(models.Model):
    EMPLOYMENT_TYPE_CHOICES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('remote', 'Remote'),
    )

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True, null=True)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    experience_required = models.CharField(max_length=100, blank=True, null=True)  # e.g. "2-4 years"
    salary = models.CharField(max_length=100, blank=True, null=True)
    recruiter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='posted_jobs')
    responsibilities = models.TextField(blank=True)
    education_requirements = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=(('draft', 'Draft'), ('published', 'Published')), default='published')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['location']),
            models.Index(fields=['recruiter', 'status']),
        ]

    def __str__(self):
        return f"{self.title} @ {self.company}"


class JobSkill(models.Model):
    IMPORTANCE_CHOICES = (
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    )

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='job_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='job_links')
    required = models.BooleanField(default=True)
    importance = models.CharField(max_length=10, choices=IMPORTANCE_CHOICES, default='medium')

    class Meta:
        unique_together = ('job', 'skill')

    def __str__(self):
        return f"{self.job.title} - {self.skill.name}"
