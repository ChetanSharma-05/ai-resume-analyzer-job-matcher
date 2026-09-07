from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from jobs.models import Job
from resumes.models import Resume
from users.models import User


class ApplicationWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.candidate = User.objects.create_user(username='candidate', email='candidate@example.com', password='Password123')
        self.recruiter = User.objects.create_user(username='recruiter', email='recruiter@example.com', password='Password123', role='recruiter')
        self.job = Job.objects.create(
            recruiter=self.recruiter,
            title='Backend Engineer',
            company='Acme',
            description='Build Python APIs with Django.',
            status='published',
        )
        self.resume = Resume.objects.create(
            user=self.candidate,
            title='Resume',
            file=SimpleUploadedFile('resume.pdf', b'%PDF-1.4 test', content_type='application/pdf'),
            file_type='pdf',
            extracted_text='Python Django API developer',
            is_processed=True,
            ats_score=82,
        )
        self.client.force_authenticate(self.candidate)

    def test_candidate_can_apply_and_duplicate_is_rejected(self):
        payload = {
            'job': self.job.id,
            'resume': self.resume.id,
            'phone': '+91 9876543210',
            'location': 'Delhi',
            'portfolio_url': 'https://example.com/profile',
            'notice_period': 'Immediate',
            'cover_letter': 'I am interested.',
        }
        response = self.client.post('/api/applications/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['phone'], '+91 9876543210')
        self.assertIn('/api/applications/', response.data['resume_download_url'])
        duplicate = self.client.post('/api/applications/', payload, format='json')
        self.assertEqual(duplicate.status_code, 400)

    def test_recruiter_can_update_only_own_application_status(self):
        response = self.client.post('/api/applications/', {'job': self.job.id, 'resume': self.resume.id}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        application_id = response.data.get('id') or response.data.get('data', {}).get('id') or response.data.get('application', {}).get('id')
        self.assertIsNotNone(application_id, response.data)
        self.client.force_authenticate(self.recruiter)
        status_response = self.client.patch(f'/api/applications/{application_id}/status/', {'status': 'shortlisted'}, format='json')
        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.data['data']['status'], 'shortlisted')

    def test_recruiter_can_create_job_with_skills(self):
        self.client.force_authenticate(self.recruiter)
        response = self.client.post('/api/applications/recruiter/jobs/', {
            'title': 'Frontend Developer',
            'company': 'Innodata',
            'location': 'Noida',
            'employment_type': 'full_time',
            'experience_required': '0',
            'salary': '50000',
            'description': 'Build frontend features.',
            'responsibilities': 'Develop UI.',
            'education_requirements': 'Any degree',
            'status': 'published',
            'required_skills': 'React, JavaScript',
            'preferred_skills': 'Docker',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['title'], 'Frontend Developer')
        self.assertEqual(response.data['recruiter'], self.recruiter.id)

    def test_job_recruiter_can_download_candidate_resume(self):
        self.client.post('/api/applications/', {'job': self.job.id, 'resume': self.resume.id}, format='json')
        from applications.models import Application
        application = Application.objects.get(candidate=self.candidate, job=self.job)
        self.client.force_authenticate(self.recruiter)
        response = self.client.get(f'/api/applications/{application.id}/resume/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Disposition'].startswith('attachment;'), True)
