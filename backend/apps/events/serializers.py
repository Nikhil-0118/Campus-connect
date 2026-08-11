"""
CampusConnect — Event Serializers
====================================
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Event, EventRegistration

User = get_user_model()


class EventOrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name")
        read_only_fields = fields


class EventSerializer(serializers.ModelSerializer):
    organizer_detail = EventOrganizerSerializer(source="organizer", read_only=True)
    registration_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "description",
            "organizer",
            "organizer_detail",
            "venue",
            "date",
            "start_time",
            "end_time",
            "image",
            "category",
            "registration_link",
            "registration_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "organizer", "created_at", "updated_at")

    def get_registration_count(self, obj):
        return obj.registrations.count()


class EventRegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = EventRegistration
        fields = ("id", "event", "event_title", "user", "username", "created_at")
        read_only_fields = fields
