"""
CampusConnect — Lost & Found Serializers
==========================================
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import LostFoundItem

User = get_user_model()


class LostFoundUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name")
        read_only_fields = fields


class LostFoundItemSerializer(serializers.ModelSerializer):
    user_detail = LostFoundUserSerializer(source="user", read_only=True)

    class Meta:
        model = LostFoundItem
        fields = (
            "id",
            "user",
            "user_detail",
            "item_type",
            "title",
            "description",
            "category",
            "image",
            "location",
            "date",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")


class LostFoundMatchSerializer(serializers.Serializer):
    """Serializer for match results."""

    item = LostFoundItemSerializer()
    score = serializers.IntegerField()
