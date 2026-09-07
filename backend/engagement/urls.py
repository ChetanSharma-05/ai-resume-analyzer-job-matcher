from django.urls import path

from .views import (
    InterviewListCreateView,
    NotificationListView,
    NotificationReadView,
    RecommendationListView,
    SavedJobDeleteView,
    SavedJobListCreateView,
    AdminAnalyticsView,
)

urlpatterns = [
    path('saved-jobs/', SavedJobListCreateView.as_view(), name='saved-job-list'),
    path('saved-jobs/<int:pk>/', SavedJobDeleteView.as_view(), name='saved-job-delete'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path('interviews/', InterviewListCreateView.as_view(), name='interview-list'),
    path('recommendations/', RecommendationListView.as_view(), name='recommendation-list'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
]
