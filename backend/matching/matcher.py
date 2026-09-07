"""
The core matching engine.

final_score = (skill_score * SKILL_WEIGHT) + (semantic_score * SEMANTIC_WEIGHT)

Weights are read from settings so they stay configurable without touching
this logic (per the project's "keep the formula configurable" requirement).

Semantic similarity: we use a lightweight, dependency-free TF-IDF + cosine
similarity approach here so the matching engine works out-of-the-box without
requiring a multi-hundred-MB sentence-transformers model download in every
environment. The `SemanticMatcher` class is isolated specifically so it can
be swapped for a real sentence-transformers embedding model later (see the
commented alternative implementation below) without touching any other code.
"""
import re
import math
from collections import Counter
from django.conf import settings


def _tokenize(text: str) -> list:
    return re.findall(r'[a-zA-Z]+', text.lower())


class SemanticMatcher:
    """
    TF-IDF + cosine similarity semantic matcher.

    To upgrade to real embeddings later (e.g. sentence-transformers), replace
    the body of `similarity()` with something like:

        from sentence_transformers import SentenceTransformer, util
        model = SentenceTransformer('all-MiniLM-L6-v2')
        emb1 = model.encode(text1, convert_to_tensor=True)
        emb2 = model.encode(text2, convert_to_tensor=True)
        return float(util.cos_sim(emb1, emb2)) * 100

    The rest of the matching engine (matcher.py, services.py) does not need
    to change at all - it only calls `similarity(text1, text2)`.
    """

    @staticmethod
    def similarity(text1: str, text2: str) -> float:
        if not text1 or not text2:
            return 0.0

        tokens1 = _tokenize(text1)
        tokens2 = _tokenize(text2)
        if not tokens1 or not tokens2:
            return 0.0

        vocab = set(tokens1) | set(tokens2)
        vec1 = Counter(tokens1)
        vec2 = Counter(tokens2)

        dot_product = sum(vec1[w] * vec2[w] for w in vocab)
        magnitude1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
        magnitude2 = math.sqrt(sum(v ** 2 for v in vec2.values()))

        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0

        cosine = dot_product / (magnitude1 * magnitude2)
        return round(cosine * 100, 2)


def calculate_skill_match(resume_skill_names: set, job_skill_names: set) -> dict:
    matched = sorted(resume_skill_names & job_skill_names)
    missing = sorted(job_skill_names - resume_skill_names)

    if not job_skill_names:
        skill_score = 0.0
    else:
        skill_score = round((len(matched) / len(job_skill_names)) * 100, 2)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_score": skill_score,
    }


def calculate_match(resume, job) -> dict:
    """
    Main entry point. Takes a Resume and Job model instance and returns
    the full match breakdown, ready to be persisted as a MatchResult.
    """
    resume_skill_names = {rs.skill.name for rs in resume.resume_skills.all()}
    job_skill_names = {js.skill.name for js in job.job_skills.all()}

    skill_result = calculate_skill_match(resume_skill_names, job_skill_names)

    semantic_score = SemanticMatcher.similarity(
        resume.extracted_text or "",
        job.description or "",
    )

    skill_weight = getattr(settings, 'MATCH_SKILL_WEIGHT', 0.60)
    semantic_weight = getattr(settings, 'MATCH_SEMANTIC_WEIGHT', 0.40)

    final_score = round(
        (skill_result["skill_score"] * skill_weight) + (semantic_score * semantic_weight),
        2,
    )

    return {
        "matched_skills": skill_result["matched_skills"],
        "missing_skills": skill_result["missing_skills"],
        "skill_score": skill_result["skill_score"],
        "semantic_score": semantic_score,
        "match_score": final_score,
    }
