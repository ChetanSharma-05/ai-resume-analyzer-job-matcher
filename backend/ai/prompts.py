"""
Centralized prompt templates for every AI feature. Keeping prompts here
(rather than scattered inline in services.py) makes them easy to tune
without touching request/response handling code.
"""

RESUME_SUMMARY_PROMPT = """You are a professional resume writer.
Based ONLY on the resume text below, write a concise 3-4 sentence professional
summary suitable for the top of a resume. Do not invent any skills, companies,
job titles, or achievements that are not present in the text.

Resume text:
{resume_text}
"""

RESUME_IMPROVEMENT_PROMPT = """You are a resume coach. Review the resume text below
and suggest 3-5 concrete improvements to bullet points or phrasing to make them
more results-oriented and ATS-friendly.

IMPORTANT RULES:
- Never invent specific numbers, metrics, or percentages the candidate did not provide.
- If you suggest adding a metric, phrase it as a placeholder like "[X%]" or "[quantify impact]",
  clearly marked as something the candidate must fill in themselves.
- Clearly separate "rewriting for clarity" from "facts you added" - do not add facts.

Resume text:
{resume_text}
"""

MISSING_SKILLS_EXPLANATION_PROMPT = """A candidate is missing the following skills
for a job they are interested in: {missing_skills}

For each missing skill, briefly explain (1-2 sentences) why it commonly matters
for roles like "{job_title}", in plain language. Do not exaggerate its importance.
"""

JOB_DESCRIPTION_ANALYSIS_PROMPT = """Analyze the following job description and extract,
as JSON only (no other text):
{{
  "required_skills": [...],
  "preferred_skills": [...],
  "experience_level": "...",
  "education_requirement": "...",
  "key_responsibilities": [...]
}}

Job description:
{job_description}
"""

INTERVIEW_QUESTIONS_PROMPT = """Based on this job description and the candidate's matched skills,
generate 5 relevant interview questions (mix of technical and behavioral) that a candidate
should prepare for. Return them as a numbered list only.

Job description:
{job_description}

Candidate's matched skills: {matched_skills}
"""

INTERVIEW_PACK_PROMPT = """Create an interview preparation pack as JSON only for this job.
Return exactly: {{"technical_questions": [], "hr_questions": [], "project_questions": [], "sample_answers": [], "tips": []}}.
Use only the candidate skills and job details provided. Do not invent candidate achievements.

Job description:
{job_description}

Candidate matched skills: {matched_skills}
"""
