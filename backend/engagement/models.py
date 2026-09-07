from django.conf import settings
from django.db import models

from jobs.models import Job
from resumes.models import Resume
from applications.models import Application


class SavedJob(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [models.UniqueConstraint(fields=['user', 'job'], name='unique_saved_job')]


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    kind = models.CharField(max_length=50, default='general')
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'is_read', '-created_at'])]


class Interview(models.Model):
    INTERVIEW_TYPES = (('video', 'Video'), ('phone', 'Phone'), ('onsite', 'On-site'))
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    scheduled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='scheduled_interviews')
    scheduled_at = models.DateTimeField()
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPES, default='video')
    meeting_link = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_at']
        indexes = [models.Index(fields=['scheduled_at'])]


class Recommendation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='recommendations')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='recommendations')
    score = models.FloatField()
    reason = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score']
        constraints = [models.UniqueConstraint(fields=['user', 'resume', 'job'], name='unique_resume_recommendation')]
