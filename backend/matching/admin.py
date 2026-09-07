from django.contrib import admin
from .models import MatchResult


@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ('resume', 'job', 'match_score', 'skill_score', 'semantic_score', 'created_at')
