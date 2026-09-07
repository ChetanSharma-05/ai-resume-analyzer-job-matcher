from django.core.management.base import BaseCommand

from jobs.models import Job
from resumes.models import Skill
from users.models import RecruiterProfile, User


class Command(BaseCommand):
    help = 'Create a recruiter, company profile, common skills, and sample jobs for local development.'

    def handle(self, *args, **options):
        recruiter, created = User.objects.get_or_create(
            email='recruiter@resumeai.local',
            defaults={'username': 'demo_recruiter', 'first_name': 'Demo', 'last_name': 'Recruiter', 'role': 'recruiter'},
        )
        if created:
            recruiter.set_password('Password123!')
            recruiter.save(update_fields=['password'])
        RecruiterProfile.objects.get_or_create(user=recruiter, defaults={'company_name': 'ResumeAI Labs', 'industry': 'Technology', 'company_location': 'Remote'})
        for name in ('Python', 'Django', 'React', 'JavaScript', 'PostgreSQL', 'Docker', 'AWS'):
            Skill.objects.get_or_create(name=name)
        jobs = [
            ('Backend Python Engineer', 'Build APIs and data services with Python and Django.'),
            ('Frontend React Developer', 'Create accessible product experiences with React and JavaScript.'),
            ('Full Stack Engineer', 'Work across Django, React, PostgreSQL, and Docker.'),
        ]
        for title, description in jobs:
            Job.objects.get_or_create(title=title, recruiter=recruiter, defaults={'company': 'ResumeAI Labs', 'description': description, 'location': 'Remote', 'employment_type': 'full_time', 'status': 'published'})
        self.stdout.write(self.style.SUCCESS('Demo recruiter, skills, and jobs are ready. Login: recruiter@resumeai.local / Password123!'))