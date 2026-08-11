"""
CampusConnect — Connection Admin
==================================
"""

from django.contrib import admin

from .models import Connection


@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("sender__username", "receiver__username")
    list_select_related = ("sender", "receiver")
    raw_id_fields = ("sender", "receiver")
