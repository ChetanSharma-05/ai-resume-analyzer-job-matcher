from django.db import models
from resumes.models import Resume
from jobs.models import Job


class MatchResult(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='match_results')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='match_results')
    match_score = models.FloatField()
    matched_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    skill_score = models.FloatField(default=0)
    semantic_score = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-match_score']
        indexes = [
            models.Index(fields=['resume', 'job']),
        ]

    def __str__(self):
        return f"{self.resume.title} <-> {self.job.title}: {self.match_score}%"
