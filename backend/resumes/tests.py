from django.test import TestCase
from .analyzer import extract_skills, extract_contact_info, analyze_resume_text
from .scoring import calculate_ats_score


class SkillExtractionTests(TestCase):
    def test_extracts_known_skills(self):
        text = "Experienced in Python, Django, React and PostgreSQL development."
        skills = extract_skills(text)
        names = [s["name"] for s in skills]
        self.assertIn("Python", names)
        self.assertIn("Django", names)
        self.assertIn("React", names)
        self.assertIn("PostgreSQL", names)

    def test_normalizes_synonyms(self):
        text = "Worked extensively with Postgres and ReactJS."
        skills = extract_skills(text)
        names = [s["name"] for s in skills]
        self.assertIn("PostgreSQL", names)
        self.assertIn("React", names)

    def test_no_false_positive_for_java_in_javascript(self):
        text = "I know JavaScript well."
        skills = extract_skills(text)
        names = [s["name"] for s in skills]
        self.assertIn("JavaScript", names)
        self.assertNotIn("Java", names)


class ContactExtractionTests(TestCase):
    def test_extracts_email(self):
        text = "John Doe\njohn.doe@example.com\n123-456-7890"
        contact = extract_contact_info(text)
        self.assertEqual(contact["email"], "john.doe@example.com")


class SectionExtractionTests(TestCase):
    def test_extracts_resume_sections_and_alias_headers(self):
        text = """PROJECTS
Student Leave Management System
Tech Stack: Java, Spring Boot, React.js
Built a full-stack application
INTERNSHIP EXPERIENCE
Elevate Labs August 2025 - September 2025
Java Developer Intern Bangalore
EDUCATION
Tula's Institute August 2024 - August 2026
Master's, Master of Computer Applications (MCA)
CERTIFICATIONS
HTML, CSS & JavaScript - Udemy
"""

        analysis = analyze_resume_text(text)

        self.assertEqual(len(analysis["projects"]), 1)
        self.assertEqual(analysis["projects"][0]["name"], "Student Leave Management System")
        self.assertEqual(len(analysis["experience"]), 1)
        self.assertEqual(analysis["experience"][0]["company"], "Elevate Labs")
        self.assertEqual(len(analysis["education"]), 1)
        self.assertEqual(len(analysis["certifications"]), 1)
