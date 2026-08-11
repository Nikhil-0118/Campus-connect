"""
CampusConnect — Team Admin
============================
"""

from django.contrib import admin

from .models import Team, TeamMember


class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 0
    raw_id_fields = ("user",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "creator", "hackathon_name", "status", "max_members", "current_member_count", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "description", "hackathon_name")
    list_select_related = ("creator",)
    raw_id_fields = ("creator",)
    inlines = [TeamMemberInline]

    @admin.display(description="Members")
    def current_member_count(self, obj):
        return obj.current_member_count


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("user", "team", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("user__username", "team__name")
    list_select_related = ("user", "team")
    raw_id_fields = ("user", "team")
