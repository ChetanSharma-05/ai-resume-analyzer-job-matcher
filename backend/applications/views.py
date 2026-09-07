from django.db.models import Count, Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse

from common.utilities import success_response
from matching.services import match_resume_with_job
from .models import Application, ApplicationHistory
from .serializers import ApplicationCreateSerializer, ApplicationSerializer, ApplicationStatusSerializer
from engagement.models import Notification


def is_candidate(user):
    return user.role in ('user', 'candidate')


def is_recruiter(user):
    return user.role == 'recruiter'


class ApplicationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Application.objects.select_related('candidate', 'job', 'resume').all()
        if is_recruiter(user):
            return Application.objects.select_related('candidate', 'job', 'resume').filter(job__recruiter=user)
        return Application.objects.select_related('candidate', 'job', 'resume').filter(candidate=user)

    def get_serializer_class(self):
        return ApplicationCreateSerializer if self.request.method == 'POST' else ApplicationSerializer

    def perform_create(self, serializer):
        if not is_candidate(self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only candidates can apply for jobs.')
        application = serializer.save(candidate=self.request.user)
        match = match_resume_with_job(application.resume, application.job)
        application.ats_score = application.resume.ats_score
        application.skill_match_score = match.skill_score
        application.semantic_score = match.semantic_score
        application.match_score = match.match_score
        application.matched_skills = match.matched_skills
        application.missing_skills = match.missing_skills
        application.save(update_fields=['ats_score', 'skill_match_score', 'semantic_score', 'match_score', 'matched_skills', 'missing_skills', 'updated_at'])
        ApplicationHistory.objects.create(application=application, status=application.status, changed_by=self.request.user)
        Notification.objects.create(
            user=application.job.recruiter,
            title='New application received',
            message=f'{application.candidate.get_full_name() or application.candidate.username} applied for {application.job.title}.',
            kind='application',
            link='/recruiter/applications',
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(ApplicationSerializer(serializer.instance, context={'request': request}).data, status=status.HTTP_201_CREATED)


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Application.objects.all()
        if is_recruiter(user):
            return Application.objects.filter(job__recruiter=user)
        return Application.objects.filter(candidate=user)

    def perform_destroy(self, instance):
        if instance.candidate_id != self.request.user.id and self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only withdraw your own application.')
        if instance.status not in ('applied', 'under_review'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError('This application can no longer be withdrawn.')
        instance.status = 'withdrawn'
        instance.save(update_fields=['status', 'updated_at'])
        ApplicationHistory.objects.create(application=instance, status='withdrawn', changed_by=self.request.user)


class ApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            application = Application.objects.select_related('job').get(pk=pk)
        except Application.DoesNotExist:
            return Response({'success': False, 'message': 'Application not found.', 'errors': {}}, status=404)
        if request.user.role != 'admin' and application.job.recruiter_id != request.user.id:
            return Response({'success': False, 'message': 'You do not have permission to update this application.', 'errors': {}}, status=403)
        serializer = ApplicationStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application.status = serializer.validated_data['status']
        application.save(update_fields=['status', 'updated_at'])
        ApplicationHistory.objects.create(
            application=application,
            status=application.status,
            comment=serializer.validated_data.get('comment', ''),
            changed_by=request.user,
        )
        Notification.objects.create(
            user=application.candidate,
            title='Application status updated',
            message=f'Your application for {application.job.title} is now {application.get_status_display()}.',
            kind='status',
            link='/applications',
        )
        return success_response(data=ApplicationSerializer(application, context={'request': request}).data, message='Application status updated.')


class ApplicationResumeDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            application = Application.objects.select_related('job', 'resume').get(pk=pk)
        except Application.DoesNotExist:
            return Response({'success': False, 'message': 'Application not found.', 'errors': {}}, status=404)
        allowed = request.user.role == 'admin' or application.candidate_id == request.user.id or application.job.recruiter_id == request.user.id
        if not allowed:
            return Response({'success': False, 'message': 'You do not have permission to download this resume.', 'errors': {}}, status=403)
        response = FileResponse(application.resume.file.open('rb'), as_attachment=True, filename=application.resume.file.name.rsplit('/', 1)[-1])
        return response


class MyApplicationsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user).select_related('job', 'resume')


class RecruiterJobsView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.posted_jobs.annotate(application_count=Count('applications')).order_by('-created_at')

    def get_serializer_class(self):
        from jobs.serializers import JobListSerializer, JobWriteSerializer
        return JobWriteSerializer if self.request.method == 'POST' else JobListSerializer

    def perform_create(self, serializer):
        if not is_recruiter(self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only recruiters can create jobs.')
        serializer.save(recruiter=self.request.user)


class RecruiterApplicationsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        queryset = Application.objects.filter(job__recruiter=self.request.user).select_related('candidate', 'job', 'resume')
        status_filter = self.request.query_params.get('status')
        min_match = self.request.query_params.get('min_match')
        search = self.request.query_params.get('search')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if min_match:
            queryset = queryset.filter(match_score__gte=min_match)
        if search:
            queryset = queryset.filter(
                Q(candidate__first_name__icontains=search)
                | Q(candidate__last_name__icontains=search)
                | Q(candidate__email__icontains=search)
                | Q(job__title__icontains=search)
            )
        return queryset
