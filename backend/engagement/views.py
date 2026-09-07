from django.db.models import Avg, Count, Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.models import Application
from matching.services import match_resume_with_job
from resumes.models import Resume
from .models import Interview, Notification, Recommendation, SavedJob
from .serializers import InterviewSerializer, NotificationSerializer, RecommendationSerializer, SavedJobSerializer


class SavedJobListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedJobSerializer

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user).select_related('job')

    def perform_create(self, serializer):
        job = serializer.validated_data['job']
        SavedJob.objects.get_or_create(user=self.request.user, job=job)


class SavedJobDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedJobSerializer

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)


class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        updated = Notification.objects.filter(pk=pk, user=request.user).update(is_read=True)
        if not updated:
            return Response({'success': False, 'message': 'Notification not found.', 'errors': {}}, status=404)
        return Response({'success': True, 'message': 'Notification marked as read.', 'data': {}})


class InterviewListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InterviewSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'recruiter':
            return Interview.objects.filter(application__job__recruiter=user).select_related('application__job', 'application__candidate')
        return Interview.objects.filter(application__candidate=user).select_related('application__job')

    def perform_create(self, serializer):
        application = serializer.validated_data['application']
        if self.request.user.role != 'recruiter' or application.job.recruiter_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only the job recruiter can schedule interviews.')
        interview = serializer.save(scheduled_by=self.request.user)
        Notification.objects.create(user=application.candidate, title='Interview scheduled', message=f'An interview was scheduled for {application.job.title}.', kind='interview', link='/applications')


class RecommendationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RecommendationSerializer

    def get_queryset(self):
        return Recommendation.objects.filter(user=self.request.user).select_related('job', 'resume')

    def list(self, request, *args, **kwargs):
        resume = Resume.objects.filter(user=request.user, is_processed=True).first()
        if resume:
            for job in __import__('jobs.models', fromlist=['Job']).Job.objects.filter(status='published')[:50]:
                match = match_resume_with_job(resume, job)
                Recommendation.objects.update_or_create(
                    user=request.user, resume=resume, job=job,
                    defaults={'score': match.match_score, 'reason': {'matched_skills': match.matched_skills, 'missing_skills': match.missing_skills}},
                )
        return super().list(request, *args, **kwargs)


class AdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'success': False, 'message': 'Admin access required.', 'errors': {}}, status=403)
        from applications.models import Application
        from jobs.models import Job
        from resumes.models import Resume
        from users.models import RecruiterProfile, User
        return Response({
            'success': True,
            'data': {
                'users': User.objects.count(),
                'candidates': User.objects.filter(role='user').count(),
                'recruiters': RecruiterProfile.objects.count(),
                'jobs': Job.objects.count(),
                'applications': Application.objects.count(),
                'resumes': Resume.objects.count(),
                'average_ats_score': Resume.objects.filter(ats_score__isnull=False).aggregate(value=Avg('ats_score'))['value'] or 0,
                'average_match_score': Application.objects.filter(match_score__isnull=False).aggregate(value=Avg('match_score'))['value'] or 0,
                'application_statuses': list(Application.objects.values('status').annotate(count=Count('id')).order_by('status')),
            },
        })
