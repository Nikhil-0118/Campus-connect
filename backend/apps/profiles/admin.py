"""
CampusConnect — Profile Admin
===============================
"""

from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "get_department", "get_branch", "get_year", "created_at")
    list_filter = ("user__department", "user__branch", "user__year")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")
    list_select_related = ("user", "user__department", "user__branch")
    raw_id_fields = ("user",)

    @admin.display(description="Department", ordering="user__department")
    def get_department(self, obj):
        return obj.user.department

    @admin.display(description="Branch", ordering="user__branch")
    def get_branch(self, obj):
        return obj.user.branch

    @admin.display(description="Year", ordering="user__year")
    def get_year(self, obj):
        return obj.user.year
