from django.contrib import admin
from .models import Resume, Skill, ResumeSkill, Education, Experience, Project, Certification

admin.site.register(Skill)
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Project)
admin.site.register(Certification)


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'file_type', 'ats_score', 'is_processed', 'created_at')
    list_filter = ('file_type', 'is_processed')
    search_fields = ('title', 'user__email')


@admin.register(ResumeSkill)
class ResumeSkillAdmin(admin.ModelAdmin):
    list_display = ('resume', 'skill', 'confidence_score')
