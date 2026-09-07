from .models import MatchResult
from .matcher import calculate_match
from resumes.models import Resume
from jobs.models import Job


def match_resume_with_job(resume: Resume, job: Job) -> MatchResult:
    result = calculate_match(resume, job)

    match_result, _ = MatchResult.objects.update_or_create(
        resume=resume, job=job,
        defaults={
            "match_score": result["match_score"],
            "matched_skills": result["matched_skills"],
            "missing_skills": result["missing_skills"],
            "skill_score": result["skill_score"],
            "semantic_score": result["semantic_score"],
        },
    )
    return match_result


def match_resume_with_all_jobs(resume: Resume, limit: int = 20):
    """Runs the resume against every job in the system - used for the
    'recommended jobs' feature. Limited to avoid O(n) blowup on huge job tables;
    in a real production system this would be paginated/queued."""
    results = []
    for job in Job.objects.all()[:limit]:
        results.append(match_resume_with_job(resume, job))
    results.sort(key=lambda r: r.match_score, reverse=True)
    return results
