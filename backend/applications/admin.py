from django.contrib import admin

from .models import Application, ApplicationHistory


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job', 'status', 'match_score', 'applied_at')
    list_filter = ('status',)
    search_fields = ('candidate__email', 'job__title', 'job__company')


@admin.register(ApplicationHistory)
class ApplicationHistoryAdmin(admin.ModelAdmin):
    list_display = ('application', 'status', 'changed_by', 'created_at')
    list_filter = ('status',)