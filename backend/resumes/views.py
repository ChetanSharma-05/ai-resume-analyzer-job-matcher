from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Resume
from .serializers import ResumeListSerializer, ResumeDetailSerializer, ResumeUploadSerializer
from .services import validate_uploaded_file, process_resume, ResumeProcessingError
from common.utilities import success_response
from engagement.tasks import process_resume_async


class ResumeListView(generics.ListAPIView):
    """GET /api/resumes/ - list the logged-in user's resumes."""
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeListSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


class ResumeUploadView(APIView):
    """POST /api/resumes/upload/"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        title = request.data.get('title') or (uploaded_file.name if uploaded_file else None)

        if not uploaded_file:
            return Response_error("A resume file is required.")

        try:
            ext = validate_uploaded_file(uploaded_file)
        except ResumeProcessingError as exc:
            return Response_error(str(exc))

        resume = Resume.objects.create(
            user=request.user,
            title=title,
            file=uploaded_file,
            file_type=ext,
        )

        process_resume_async.delay(resume.id)
        return success_response(
            data=ResumeDetailSerializer(resume).data,
            message="Resume uploaded. Analysis is processing in the background.",
            status_code=status.HTTP_202_ACCEPTED,
        )


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    """GET/DELETE /api/resumes/<id>/"""
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeDetailSerializer

    def get_queryset(self):
        # Scoping the queryset to the current user is itself the security
        # control here - a user simply cannot retrieve/delete an id that
        # isn't theirs, regardless of what the frontend sends.
        return Resume.objects.filter(user=self.request.user)


class ResumeReanalyzeView(APIView):
    """POST /api/resumes/<id>/analyze/ - re-runs the analysis pipeline."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
        except Resume.DoesNotExist:
            return Response_error("Resume not found.", status_code=404)

        resume = process_resume(resume)
        return success_response(
            data=ResumeDetailSerializer(resume).data,
            message="Resume re-analyzed.",
        )


def Response_error(message, status_code=400):
    from rest_framework.response import Response
    return Response(
        {"success": False, "message": message, "errors": {}},
        status=status_code,
    )
