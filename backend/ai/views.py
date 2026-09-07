from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from . import services
from resumes.models import Resume
from jobs.models import Job
from matching.models import MatchResult
from common.utilities import success_response


def error_response(message, status_code=404):
    from rest_framework.response import Response
    return Response({"success": False, "message": message, "errors": {}}, status=status_code)


class ResumeSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resume_id = request.data.get('resume_id')
        try:
            resume = Resume.objects.get(pk=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return error_response("Resume not found.")
        result = services.generate_resume_summary(resume.extracted_text or "")
        return success_response(data=result)


class ResumeImprovementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resume_id = request.data.get('resume_id')
        try:
            resume = Resume.objects.get(pk=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return error_response("Resume not found.")
        result = services.generate_resume_improvements(resume.extracted_text or "")
        return success_response(data=result)


class JobAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get('job_id')
        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return error_response("Job not found.")
        result = services.analyze_job_description(job.description)
        return success_response(data=result)


class InterviewQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        match_id = request.data.get('match_id')
        try:
            match = MatchResult.objects.get(pk=match_id, resume__user=request.user)
        except MatchResult.DoesNotExist:
            return error_response("Match result not found.")
        result = services.generate_interview_questions(match.job.description, match.matched_skills)
        return success_response(data=result)


class InterviewPackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        match_id = request.data.get('match_id')
        try:
            match = MatchResult.objects.get(pk=match_id, resume__user=request.user)
        except MatchResult.DoesNotExist:
            return error_response("Match result not found.")
        result = services.generate_interview_pack(match.job.description, match.matched_skills)
        return success_response(data=result)
