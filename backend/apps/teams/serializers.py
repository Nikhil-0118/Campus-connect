"""
CampusConnect — Team Serializers
==================================
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Team, TeamMember

User = get_user_model()


class TeamMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = TeamMember
        fields = ("id", "user_id", "username", "role", "created_at")
        read_only_fields = fields


class TeamSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source="creator.username", read_only=True)
    members = TeamMemberSerializer(many=True, read_only=True)
    current_member_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Team
        fields = (
            "id",
            "name",
            "description",
            "creator",
            "creator_username",
            "project_description",
            "required_skills",
            "max_members",
            "hackathon_name",
            "status",
            "members",
            "current_member_count",
            "is_full",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "creator", "created_at", "updated_at")

    def validate_max_members(self, value):
        if value < 1:
            raise serializers.ValidationError("Team must allow at least 1 member.")
        return value
