from django.urls import path
from .views import ResumeListView, ResumeUploadView, ResumeDetailView, ResumeReanalyzeView

urlpatterns = [
    path('', ResumeListView.as_view(), name='resume-list'),
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('<int:pk>/analyze/', ResumeReanalyzeView.as_view(), name='resume-analyze'),
]
