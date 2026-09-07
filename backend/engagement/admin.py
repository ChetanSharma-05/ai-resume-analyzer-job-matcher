from django.contrib import admin

from .models import Interview, Notification, Recommendation, SavedJob


admin.site.register(SavedJob)
admin.site.register(Notification)
admin.site.register(Interview)
admin.site.register(Recommendation)