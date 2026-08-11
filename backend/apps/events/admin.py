"""
CampusConnect — Event Admin
==============================
"""

from django.contrib import admin

from .models import Event, EventRegistration


class EventRegistrationInline(admin.TabularInline):
    model = EventRegistration
    extra = 0
    raw_id_fields = ("user",)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "organizer", "category", "venue", "date", "start_time", "created_at")
    list_filter = ("category", "date")
    search_fields = ("title", "description", "venue", "organizer__username")
    list_select_related = ("organizer",)
    raw_id_fields = ("organizer",)
    inlines = [EventRegistrationInline]


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ("user", "event", "created_at")
    search_fields = ("user__username", "event__title")
    list_select_related = ("user", "event")
    raw_id_fields = ("user", "event")
