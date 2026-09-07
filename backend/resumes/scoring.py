"""
ATS-style scoring. This is an APPLICATION-GENERATED score for feedback
purposes only - it is not an official ATS score from any real ATS product,
and the frontend must always label it as such.
"""

WEIGHTS = {
    "skills": 0.30,
    "keywords": 0.20,
    "experience": 0.15,
    "projects": 0.15,
    "education": 0.10,
    "certifications": 0.05,
    "completeness": 0.05,
}


def calculate_ats_score(resume, analysis: dict) -> dict:
    sections = analysis.get("raw_sections", {})

    skills_count = len(analysis.get("skills", []))
    skills_score = min(100, skills_count * 10)  # 10 relevant skills -> full marks

    # Keyword score: proxy using unique word count in the "summary"/top section
    keyword_score = min(100, len(sections.get("summary", "").split()) * 2)

    experience_score = 100 if sections.get("experience") else 0
    projects_score = 100 if sections.get("projects") else 0
    education_score = 100 if sections.get("education") else 0
    certifications_score = 100 if sections.get("certifications") else 0

    # Completeness: how many of the 5 core sections were detected at all
    core_sections = ["experience", "education", "projects", "certifications", "skills"]
    detected = sum(1 for s in core_sections if s in sections)
    completeness_score = (detected / len(core_sections)) * 100

    breakdown = {
        "skills": round(skills_score * WEIGHTS["skills"] / 100 * 100, 2),
        "keywords": round(keyword_score * WEIGHTS["keywords"] / 100 * 100, 2),
        "experience": round(experience_score * WEIGHTS["experience"] / 100 * 100, 2),
        "projects": round(projects_score * WEIGHTS["projects"] / 100 * 100, 2),
        "education": round(education_score * WEIGHTS["education"] / 100 * 100, 2),
        "certifications": round(certifications_score * WEIGHTS["certifications"] / 100 * 100, 2),
        "completeness": round(completeness_score * WEIGHTS["completeness"] / 100 * 100, 2),
    }
    breakdown["total"] = round(sum(breakdown.values()), 2)
    return breakdown
