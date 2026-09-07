from django.urls import path
from .views import SingleMatchView, ResumeMatchesView

urlpatterns = [
    path('<int:resume_id>/<int:job_id>/', SingleMatchView.as_view(), name='single-match'),
    path('<int:resume_id>/', ResumeMatchesView.as_view(), name='resume-matches'),
]
