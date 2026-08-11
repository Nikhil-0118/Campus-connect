"""
CampusConnect — Profile Serializers
=====================================
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.serializers import DepartmentMiniSerializer, BranchMiniSerializer
from .models import Profile

User = get_user_model()


class ProfileUserSerializer(serializers.ModelSerializer):
    """Nested user data shown inside a profile (public-safe fields only)."""

    department_detail = DepartmentMiniSerializer(source="department", read_only=True)
    branch_detail = BranchMiniSerializer(source="branch", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "profile_picture",
            "bio",
            "department",
            "department_detail",
            "branch",
            "branch_detail",
            "year",
            "section",
            "is_verified_student",
        )
        read_only_fields = fields


class ProfileSerializer(serializers.ModelSerializer):
    """Full profile serializer combining Profile + User data."""

    user = ProfileUserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "user",
            "skills",
            "interests",
            "social_links",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for PATCH /api/profiles/me/

    Allows updating both Profile fields and select User fields
    in a single request.
    """

    # User fields that can be updated through the profile endpoint
    first_name = serializers.CharField(required=False, source="user.first_name")
    last_name = serializers.CharField(required=False, source="user.last_name")
    bio = serializers.CharField(required=False, source="user.bio")
    profile_picture = serializers.ImageField(required=False, source="user.profile_picture")
    phone_number = serializers.CharField(required=False, source="user.phone_number")
    year = serializers.IntegerField(required=False, source="user.year")

    class Meta:
        model = Profile
        fields = (
            "skills",
            "interests",
            "social_links",
            "first_name",
            "last_name",
            "bio",
            "profile_picture",
            "phone_number",
            "year",
        )

    def update(self, instance, validated_data):
        # Extract nested user data
        user_data = validated_data.pop("user", {})

        # Update Profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update User fields
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        return instance
