"""
CampusConnect — Notification Model
=====================================
"""

from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class Notification(TimeStampedModel):
    """In-app notification for various platform events."""

    TYPE_CHOICES = (
        ("connection_request", "Connection Request"),
        ("connection_accepted", "Connection Accepted"),
        ("team_join", "Team Join"),
        ("marketplace_interest", "Marketplace Interest"),
        ("lost_found_match", "Lost & Found Match"),
        ("event_registration", "Event Registration"),
        ("general", "General"),
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_notifications",
        null=True,
        blank=True,
    )
    notification_type = models.CharField(
        max_length=25,
        choices=TYPE_CHOICES,
        default="general",
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type}] → {self.recipient.username}"
