from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .services import match_resume_with_job, match_resume_with_all_jobs
from .serializers import MatchResultSerializer, MatchResultDetailSerializer
from resumes.models import Resume
from jobs.models import Job
from common.utilities import success_response


def error_response(message, status_code=404):
    from rest_framework.response import Response
    return Response({"success": False, "message": message, "errors": {}}, status=status_code)


class SingleMatchView(APIView):
    """GET /api/matching/<resume_id>/<job_id>/ - match one resume against one job."""
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id, job_id):
        try:
            resume = Resume.objects.get(pk=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return error_response("Resume not found or not owned by you.")

        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return error_response("Job not found.")

        if not resume.is_processed:
            return error_response("Resume has not been analyzed yet.", status_code=400)

        result = match_resume_with_job(resume, job)
        return success_response(data=MatchResultDetailSerializer(result).data)


class ResumeMatchesView(APIView):
    """GET /api/matching/<resume_id>/ - all job matches for a resume, best first."""
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):
        try:
            resume = Resume.objects.get(pk=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return error_response("Resume not found or not owned by you.")

        if not resume.is_processed:
            return error_response("Resume has not been analyzed yet.", status_code=400)

        results = match_resume_with_all_jobs(resume)
        return success_response(data=MatchResultSerializer(results, many=True).data)
