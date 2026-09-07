from celery import shared_task
from django.contrib.auth import get_user_model

from .models import Recommendation
from resumes.models import Resume
from matching.services import match_resume_with_job
from jobs.models import Job


@shared_task
def process_resume_async(resume_id):
    resume = Resume.objects.get(pk=resume_id)
    from resumes.services import process_resume
    process_resume(resume)
    return resume_id


@shared_task
def refresh_recommendations(user_id):
    user = get_user_model().objects.get(pk=user_id)
    resume = Resume.objects.filter(user=user, is_processed=True).first()
    if not resume:
        return 0
    count = 0
    for job in Job.objects.filter(status='published')[:100]:
        match = match_resume_with_job(resume, job)
        Recommendation.objects.update_or_create(
            user=user,
            resume=resume,
            job=job,
            defaults={'score': match.match_score, 'reason': {'matched_skills': match.matched_skills, 'missing_skills': match.missing_skills}},
        )
        count += 1
    return count
