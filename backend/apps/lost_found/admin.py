"""
CampusConnect — Lost & Found Admin
=====================================
"""

from django.contrib import admin

from .models import LostFoundItem


@admin.register(LostFoundItem)
class LostFoundItemAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "item_type", "category", "location", "status", "date", "created_at")
    list_filter = ("item_type", "category", "status")
    search_fields = ("title", "description", "location", "user__username")
    list_select_related = ("user",)
    raw_id_fields = ("user",)
