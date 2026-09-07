from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count

from .models import Job
from .serializers import JobListSerializer, JobDetailSerializer, JobWriteSerializer
from common.permissions import IsAdminRole


class JobListCreateView(generics.ListCreateAPIView):
    """
    GET /api/jobs/  -> any authenticated user can browse/search/filter jobs
    POST /api/jobs/ -> admin only
    """
    queryset = Job.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'company', 'location', 'description']
    ordering_fields = ['created_at', 'title']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobWriteSerializer
        return JobListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        qs = Job.objects.filter(status='published')
        if self.request.user.is_authenticated and self.request.user.role in ('admin', 'recruiter'):
            qs = Job.objects.all()
        location = self.request.query_params.get('location')
        employment_type = self.request.query_params.get('employment_type')
        if location:
            qs = qs.filter(location__icontains=location)
        if employment_type:
            qs = qs.filter(employment_type=employment_type)
        return qs.annotate(application_count=Count('applications'))

    def perform_create(self, serializer):
        if self.request.user.role not in ('admin', 'recruiter'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only recruiters and admins can create jobs.')
        recruiter = self.request.user if self.request.user.role == 'recruiter' else None
        serializer.save(recruiter=recruiter)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/jobs/<id>/    -> any authenticated user
    PUT/PATCH/DELETE       -> admin only
    """
    queryset = Job.objects.all()

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role in ('admin', 'recruiter'):
            return Job.objects.all()
        return Job.objects.filter(status='published')

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return JobWriteSerializer
        return JobDetailSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAuthenticated()]
        return [AllowAny()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PUT', 'PATCH', 'DELETE'):
            if request.user.role != 'admin' and obj.recruiter_id != request.user.id:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('You do not have permission to manage this job.')
