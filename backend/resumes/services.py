"""
Business-logic layer for resumes. Views stay thin; all the orchestration
(parse -> analyze -> score -> persist) happens here so it's independently
testable and reusable (e.g. from a management command or Celery task later).
"""
from django.conf import settings
from .parser import extract_text, ParsingError
from .analyzer import analyze_resume_text, get_or_create_skill_objects
from .models import Resume, ResumeSkill, Education, Experience, Project, Certification


class ResumeProcessingError(Exception):
    pass


def validate_uploaded_file(uploaded_file):
    """Validates extension and size before anything touches the filesystem."""
    name = uploaded_file.name.lower()
    ext = None
    for allowed in settings.ALLOWED_RESUME_EXTENSIONS:
        if name.endswith(allowed):
            ext = allowed.replace('.', '')
            break

    if ext is None:
        raise ResumeProcessingError(
            f"Unsupported file type. Allowed types: {', '.join(settings.ALLOWED_RESUME_EXTENSIONS)}"
        )

    max_bytes = settings.MAX_RESUME_SIZE_MB * 1024 * 1024
    if uploaded_file.size > max_bytes:
        raise ResumeProcessingError(
            f"File too large. Maximum allowed size is {settings.MAX_RESUME_SIZE_MB}MB."
        )

    return ext


def process_resume(resume: Resume) -> Resume:
    """
    Runs the full pipeline for an already-saved Resume instance:
    extract text -> analyze -> compute ATS score -> persist skills.
    Any failure is captured on the resume record rather than raised loudly,
    so the upload API can still return a useful response.
    """
    try:
        with resume.file.open('rb') as f:
            text = extract_text(f, resume.file_type)
    except ParsingError as exc:
        resume.processing_error = str(exc)
        resume.is_processed = False
        resume.save(update_fields=['processing_error', 'is_processed'])
        return resume

    analysis = analyze_resume_text(text)

    resume.extracted_text = text
    resume.parsed_name = analysis.get("name")
    resume.parsed_email = analysis.get("email")
    resume.parsed_phone = analysis.get("phone")
    resume.processing_error = None
    resume.is_processed = True

    # Persist extracted skills as ResumeSkill rows
    skill_names = [s["name"] for s in analysis["skills"]]
    skill_objs = get_or_create_skill_objects(skill_names)
    confidence_map = {s["name"]: s["confidence"] for s in analysis["skills"]}

    ResumeSkill.objects.filter(resume=resume).delete()
    ResumeSkill.objects.bulk_create([
        ResumeSkill(resume=resume, skill=skill_obj, confidence_score=confidence_map[skill_obj.name])
        for skill_obj in skill_objs
    ])

    Education.objects.filter(resume=resume).delete()
    Education.objects.bulk_create([
        Education(resume=resume, degree=item["degree"], institution=item["institution"])
        for item in analysis["education"]
    ])

    Experience.objects.filter(resume=resume).delete()
    Experience.objects.bulk_create([
        Experience(
            resume=resume,
            company=item["company"],
            position=item["position"],
            description=item.get("description", ""),
        )
        for item in analysis["experience"]
    ])

    Project.objects.filter(resume=resume).delete()
    Project.objects.bulk_create([
        Project(
            resume=resume,
            name=item["name"],
            description=item.get("description", ""),
            technologies=item.get("technologies", ""),
        )
        for item in analysis["projects"]
    ])

    Certification.objects.filter(resume=resume).delete()
    Certification.objects.bulk_create([
        Certification(resume=resume, name=item["name"])
        for item in analysis["certifications"]
    ])

    # ATS scoring
    from .scoring import calculate_ats_score
    score_breakdown = calculate_ats_score(resume, analysis)
    resume.ats_score = score_breakdown["total"]

    resume.save()
    return resume
