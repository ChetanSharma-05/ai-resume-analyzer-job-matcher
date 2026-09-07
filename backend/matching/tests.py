from django.test import TestCase
from .matcher import calculate_skill_match, SemanticMatcher


class SkillMatchTests(TestCase):
    def test_matched_and_missing_skills(self):
        resume_skills = {"Python", "Django", "React", "PostgreSQL", "Git"}
        job_skills = {"Python", "Django", "FastAPI", "PostgreSQL", "Docker", "AWS"}

        result = calculate_skill_match(resume_skills, job_skills)

        self.assertEqual(set(result["matched_skills"]), {"Python", "Django", "PostgreSQL"})
        self.assertEqual(set(result["missing_skills"]), {"FastAPI", "Docker", "AWS"})
        self.assertAlmostEqual(result["skill_score"], 50.0, delta=0.01)

    def test_empty_job_skills_gives_zero_score(self):
        result = calculate_skill_match({"Python"}, set())
        self.assertEqual(result["skill_score"], 0.0)


class SemanticMatchTests(TestCase):
    def test_similar_texts_score_higher_than_unrelated(self):
        text1 = "Built REST APIs using Django and PostgreSQL."
        text2 = "Experience developing backend APIs using Python web frameworks."
        unrelated = "Painted landscapes and sold them at local art fairs."

        related_score = SemanticMatcher.similarity(text1, text2)
        unrelated_score = SemanticMatcher.similarity(text1, unrelated)

        self.assertGreater(related_score, unrelated_score)
