from django.urls import path
from .views import ResumeSummaryView, ResumeImprovementView, JobAnalysisView, InterviewQuestionsView, InterviewPackView

urlpatterns = [
    path('resume-summary/', ResumeSummaryView.as_view(), name='ai-resume-summary'),
    path('improvement/', ResumeImprovementView.as_view(), name='ai-improvement'),
    path('job-analysis/', JobAnalysisView.as_view(), name='ai-job-analysis'),
    path('interview-questions/', InterviewQuestionsView.as_view(), name='ai-interview-questions'),
    path('interview-pack/', InterviewPackView.as_view(), name='ai-interview-pack'),
]
