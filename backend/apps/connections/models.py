"""
CampusConnect — Connection Model
==================================
Student-to-student connection / follow system.
"""

from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class Connection(TimeStampedModel):
    """
    Represents a directional connection request between two students.
    The sender initiates; the receiver can accept, reject, or block.
    """

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("blocked", "Blocked"),
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_connections",
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_connections",
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending",
    )

    class Meta:
        verbose_name = "Connection"
        verbose_name_plural = "Connections"
        ordering = ["-created_at"]
        # Prevent duplicate connections in the same direction
        constraints = [
            models.UniqueConstraint(
                fields=["sender", "receiver"],
                name="uq_connection_sender_receiver",
            ),
        ]

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username} ({self.status})"
