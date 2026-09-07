"""
AI service layer. Wraps calls to an external LLM API (Anthropic Messages API
by default, configurable via .env). If AI_API_KEY is not set, every method
falls back to a clearly-labeled rule-based response so the rest of the app
(and every other feature) keeps working without requiring a paid API key.

This isolation is intentional: matching, ATS scoring, and skill extraction
never depend on this module. Only the "smart suggestions" features do.
"""
import json
from django.conf import settings
from . import prompts


class AIServiceError(Exception):
    pass


def _call_llm(prompt: str) -> str:
    """
    Call Google Gemini using the official Google Gen AI SDK.
    """
    if not settings.AI_API_KEY:
        raise AIServiceError("AI_API_KEY not configured")

    try:
        from google import genai

        client = genai.Client(api_key=settings.AI_API_KEY)

        response = client.models.generate_content(
            model=settings.AI_MODEL,
            contents=prompt,
        )

        text = (response.text or "").strip()

        if not text:
            raise AIServiceError("Gemini returned an empty response")

        return text

    except AIServiceError:
        raise

    except Exception as exc:
        raise AIServiceError(f"Gemini API error: {exc}") from exc

def generate_resume_summary(resume_text: str) -> dict:
    prompt = prompts.RESUME_SUMMARY_PROMPT.format(resume_text=resume_text[:6000])
    try:
        summary = _call_llm(prompt)
        return {"summary": summary, "source": "ai"}
    except AIServiceError:
        # Rule-based fallback: no invented facts, just a generic template note.
        return {
            "summary": (
                "AI summary generation is temporarily unavailable. Check the AI model "
                "and API configuration, then try again."
            ),
            "source": "fallback",
        }


def generate_resume_improvements(resume_text: str) -> dict:
    prompt = prompts.RESUME_IMPROVEMENT_PROMPT.format(resume_text=resume_text[:6000])
    try:
        suggestions = _call_llm(prompt)
        return {"suggestions": suggestions, "source": "ai"}
    except AIServiceError:
        return {
            "suggestions": (
                "AI-powered improvement suggestions are temporarily unavailable. General "
                "tips: start bullet points with strong action verbs, quantify impact wherever "
                "you genuinely can (e.g. '[X%] faster', '[X] users'), and keep each bullet "
                "to one line."
            ),
            "source": "fallback",
        }


def explain_missing_skills(missing_skills: list, job_title: str) -> dict:
    prompt = prompts.MISSING_SKILLS_EXPLANATION_PROMPT.format(
        missing_skills=", ".join(missing_skills), job_title=job_title,
    )
    try:
        explanation = _call_llm(prompt)
        return {"explanation": explanation, "source": "ai"}
    except AIServiceError:
        bullet_list = "\n".join(f"- {skill}: commonly required for this type of role." for skill in missing_skills)
        return {"explanation": bullet_list, "source": "fallback"}


def analyze_job_description(job_description: str) -> dict:
    prompt = prompts.JOB_DESCRIPTION_ANALYSIS_PROMPT.format(job_description=job_description[:6000])
    try:
        raw = _call_llm(prompt)
        parsed = json.loads(raw)
        parsed["source"] = "ai"
        return parsed
    except (AIServiceError, json.JSONDecodeError):
        return {
            "required_skills": [],
            "preferred_skills": [],
            "experience_level": "Unknown",
            "education_requirement": "Unknown",
            "key_responsibilities": [],
            "source": "fallback",
            "note": "AI job description analysis requires an AI_API_KEY to be configured.",
        }


def generate_interview_questions(job_description: str, matched_skills: list) -> dict:
    prompt = prompts.INTERVIEW_QUESTIONS_PROMPT.format(
        job_description=job_description[:4000],
        matched_skills=", ".join(matched_skills),
    )
    try:
        questions = _call_llm(prompt)
        return {"questions": questions, "source": "ai"}
    except AIServiceError:
        generic = [
            "Tell me about a project where you used one of your listed skills.",
            "Describe a challenging bug you fixed and how you approached it.",
            "How do you stay up to date with new technologies?",
            "Walk me through your experience relevant to this role.",
            "Why are you interested in this position?",
        ]
        return {"questions": "\n".join(f"{i+1}. {q}" for i, q in enumerate(generic)), "source": "fallback"}


def generate_interview_pack(job_description: str, matched_skills: list) -> dict:
    prompt = prompts.INTERVIEW_PACK_PROMPT.format(
        job_description=job_description[:5000], matched_skills=", ".join(matched_skills),
    )
    try:
        parsed = json.loads(_call_llm(prompt))
        parsed["source"] = "ai"
        return parsed
    except (AIServiceError, json.JSONDecodeError):
        return {
            "technical_questions": ["Explain a project where you used one of your matched skills."],
            "hr_questions": ["Why are you interested in this role?"],
            "project_questions": ["What tradeoff did you make in a recent project?"],
            "sample_answers": ["Answer with Situation, Action, Result and only factual examples from your experience."],
            "tips": ["Review the job requirements and prepare concise evidence for each matched skill."],
            "source": "fallback",
        }
