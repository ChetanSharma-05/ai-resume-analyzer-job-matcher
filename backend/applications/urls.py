from django.urls import path

from .views import (
    ApplicationDetailView,
    ApplicationResumeDownloadView,
    ApplicationListCreateView,
    ApplicationStatusView,
    MyApplicationsView,
    RecruiterApplicationsView,
    RecruiterJobsView,
)

urlpatterns = [
    path('', ApplicationListCreateView.as_view(), name='application-list-create'),
    path('my/', MyApplicationsView.as_view(), name='my-applications'),
    path('recruiter/', RecruiterApplicationsView.as_view(), name='recruiter-applications'),
    path('recruiter/candidates/', RecruiterApplicationsView.as_view(), name='recruiter-candidates'),
    path('recruiter/jobs/', RecruiterJobsView.as_view(), name='recruiter-jobs'),
    path('<int:pk>/status/', ApplicationStatusView.as_view(), name='application-status'),
    path('<int:pk>/resume/', ApplicationResumeDownloadView.as_view(), name='application-resume-download'),
    path('<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
]
