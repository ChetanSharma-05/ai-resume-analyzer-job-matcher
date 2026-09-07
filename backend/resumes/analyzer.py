"""
Resume analysis pipeline: turns raw extracted text into structured data
(name, email, phone, skills) using deterministic rules/regex first.
AI/LLM enrichment (summaries, suggestions) lives in the separate `ai` app -
we deliberately do NOT depend on an LLM for this basic extraction so the
app still works fully with zero AI API key configured.
"""
import re
from .models import Skill

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}')

# Canonical skill list + common synonym mapping (normalization).
# In production this would live in the DB (Skill model) and be extendable
# from the admin panel; this dict maps raw variants -> canonical name.
SKILL_SYNONYMS = {
    "python": "Python", "django": "Django", "fastapi": "FastAPI", "flask": "Flask",
    "java": "Java", "spring boot": "Spring Boot", "spring": "Spring Boot",
    "javascript": "JavaScript", "js": "JavaScript", "react": "React", "react.js": "React",
    "reactjs": "React", "node": "Node.js", "node.js": "Node.js", "nodejs": "Node.js",
    "sql": "SQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
    "postgresql db": "PostgreSQL", "mysql": "MySQL", "mongodb": "MongoDB",
    "mongo": "MongoDB", "git": "Git", "github": "Git", "docker": "Docker",
    "aws": "AWS", "amazon web services": "AWS", "azure": "Azure",
    "html": "HTML", "html5": "HTML", "css": "CSS", "css3": "CSS",
    "rest api": "REST API", "rest apis": "REST API", "restful api": "REST API",
    "redis": "Redis", "celery": "Celery", "pandas": "Pandas", "numpy": "NumPy",
    "machine learning": "Machine Learning", "ml": "Machine Learning",
    "nlp": "NLP", "natural language processing": "NLP",
    "typescript": "TypeScript", "ts": "TypeScript",
    "tailwind": "Tailwind CSS", "tailwindcss": "Tailwind CSS",
    "vue": "Vue.js", "vue.js": "Vue.js", "angular": "Angular",
    "kubernetes": "Kubernetes", "k8s": "Kubernetes",
    "graphql": "GraphQL", "linux": "Linux", "bash": "Bash",
}


def extract_contact_info(text: str) -> dict:
    email_match = EMAIL_REGEX.search(text)
    phone_match = PHONE_REGEX.search(text)

    # Naive name guess: first non-empty line that isn't an email/phone/heading
    name = None
    for line in text.splitlines()[:5]:
        line = line.strip()
        if line and len(line.split()) <= 5 and not EMAIL_REGEX.search(line) and not any(ch.isdigit() for ch in line):
            name = line
            break

    return {
        "name": name,
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
    }


def extract_skills(text: str) -> list:
    """
    Deterministic keyword-based skill extraction with normalization.
    Returns a list of dicts: [{"name": "Python", "confidence": 1.0}, ...]
    This runs BEFORE any AI enrichment step, so the core analysis always
    works even with AI_API_KEY unset.
    """
    text_lower = text.lower()
    found = {}

    for variant, canonical in SKILL_SYNONYMS.items():
        # word-boundary match to avoid partial matches like "java" inside "javascript"
        pattern = r'(?<![a-zA-Z0-9+#.])' + re.escape(variant) + r'(?![a-zA-Z0-9+#])'
        matches = re.findall(pattern, text_lower)
        if matches:
            count = len(matches)
            confidence = min(1.0, 0.6 + 0.1 * count)  # more mentions -> slightly higher confidence
            if canonical not in found or found[canonical] < confidence:
                found[canonical] = confidence

    return [{"name": name, "confidence": round(conf, 2)} for name, conf in found.items()]


def get_or_create_skill_objects(skill_names: list):
    """Ensures Skill rows exist in the DB for each extracted skill name."""
    skill_objs = []
    for name in skill_names:
        skill_obj, _ = Skill.objects.get_or_create(name=name, defaults={'category': 'other'})
        skill_objs.append(skill_obj)
    return skill_objs


def analyze_resume_text(text: str) -> dict:
    """
    Main analysis entry point. Returns a structured dict matching the
    shape described in the project spec (name, email, phone, skills, ...).
    Education/Experience/Projects/Certifications extraction is intentionally
    left lightweight here (section-detection heuristics) - full parsing of
    free-form resume layouts is a known hard NLP problem, so we keep this
    honest and extensible rather than pretending to solve it perfectly.
    """
    contact = extract_contact_info(text)
    skills = extract_skills(text)

    sections = split_into_sections(text)

    return {
        "name": contact["name"],
        "email": contact["email"],
        "phone": contact["phone"],
        "skills": skills,
        "sections_detected": list(sections.keys()),
        "raw_sections": sections,
        "education": parse_education(sections.get("education", "")),
        "experience": parse_experience(sections.get("experience", "")),
        "projects": parse_projects(sections.get("projects", "")),
        "certifications": parse_certifications(sections.get("certifications", "")),
    }


SECTION_HEADERS = {
    "experience": ["experience", "work experience", "employment history", "internship experience", "professional experience"],
    "education": ["education", "academic background"],
    "projects": ["projects", "personal projects"],
    "certifications": ["certifications", "certificates", "licenses"],
    "skills": ["skills", "technical skills"],
    "summary": ["summary", "professional summary", "objective", "profile"],
}


def split_into_sections(text: str) -> dict:
    """
    Very simple heuristic section splitter: looks for lines that match
    known section header keywords and groups the following lines under them.
    Used to give the AI layer more targeted context later, and to help the
    ATS scorer check resume completeness.
    """
    lines = text.splitlines()
    sections = {}
    current_section = "summary"
    sections[current_section] = []

    for line in lines:
        stripped = re.sub(r"[^a-z0-9 ]", "", line.strip().lower())
        matched_section = None
        for section_name, keywords in SECTION_HEADERS.items():
            normalized_keywords = [re.sub(r"[^a-z0-9 ]", "", keyword) for keyword in keywords]
            if any(stripped == kw or stripped.startswith(f"{kw} ") for kw in normalized_keywords):
                matched_section = section_name
                break

        if matched_section:
            current_section = matched_section
            sections.setdefault(current_section, [])
        else:
            sections.setdefault(current_section, []).append(line)

    return {k: "\n".join(v).strip() for k, v in sections.items() if "\n".join(v).strip()}


def _clean_lines(section_text: str) -> list:
    return [line.strip(" •-\t") for line in section_text.splitlines() if line.strip(" •-\t")]


def parse_education(section_text: str) -> list:
    """Extract common two-line education entries without inventing details."""
    lines = _clean_lines(section_text)
    entries = []
    index = 0
    while index < len(lines):
        institution_line = lines[index]
        if index + 1 < len(lines):
            degree_line = lines[index + 1]
            if any(token in degree_line.lower() for token in ("bachelor", "master", "bca", "mca", "degree", "diploma")):
                entries.append({"institution": institution_line, "degree": degree_line})
                index += 2
                continue
        index += 1
    return entries


def parse_experience(section_text: str) -> list:
    """Extract company/position pairs from common resume experience layouts."""
    lines = _clean_lines(section_text)
    entries = []
    date_pattern = re.compile(r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}", re.I)
    index = 0
    while index < len(lines):
        if index + 1 < len(lines) and date_pattern.search(lines[index]):
            company = date_pattern.sub("", lines[index]).strip(" ,-|")
            position = date_pattern.sub("", lines[index + 1]).strip(" ,-|")
            if company and position:
                description_lines = []
                index += 2
                while index < len(lines) and not date_pattern.search(lines[index]):
                    description_lines.append(lines[index])
                    index += 1
                entries.append({
                    "company": company,
                    "position": position,
                    "description": " ".join(description_lines),
                })
                continue
        index += 1
    return entries


def parse_projects(section_text: str) -> list:
    lines = _clean_lines(section_text)
    entries = []
    current = None
    for line in lines:
        if line.lower().startswith(("tech stack:", "technologies:")):
            if current:
                current["technologies"] = line.split(":", 1)[1].strip()
            continue
        if line.lower().startswith(("link to", "github", "demo")) or line.startswith("Developed") or line.startswith("Built") or line.startswith("Designed") or line.startswith("Implemented") or line.startswith("Improved") or line.startswith("Simulated"):
            if current:
                current["description"] = f"{current['description']} {line}".strip()
            continue
        if current:
            entries.append(current)
        current = {"name": line, "description": "", "technologies": ""}
    if current:
        entries.append(current)
    return entries


def parse_certifications(section_text: str) -> list:
    return [{"name": line} for line in _clean_lines(section_text)]
