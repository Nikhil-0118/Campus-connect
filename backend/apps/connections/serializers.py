"""
CampusConnect — Connection Serializers
========================================
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Connection

User = get_user_model()


class ConnectionUserSerializer(serializers.ModelSerializer):
    """Minimal user info shown in connection responses."""

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "profile_picture")
        read_only_fields = fields


class ConnectionSerializer(serializers.ModelSerializer):
    sender = ConnectionUserSerializer(read_only=True)
    receiver = ConnectionUserSerializer(read_only=True)

    class Meta:
        model = Connection
        fields = ("id", "sender", "receiver", "status", "created_at", "updated_at")
        read_only_fields = fields
