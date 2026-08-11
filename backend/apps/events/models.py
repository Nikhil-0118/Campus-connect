"""
CampusConnect — Event Models
===============================
College event discovery and registration system.
"""

from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class Event(TimeStampedModel):
    """A college event that students can discover and register for."""

    CATEGORY_CHOICES = (
        ("hackathon", "Hackathon"),
        ("workshop", "Workshop"),
        ("seminar", "Seminar"),
        ("cultural", "Cultural"),
        ("sports", "Sports"),
        ("tech", "Tech"),
        ("club", "Club"),
        ("other", "Other"),
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organized_events",
    )
    venue = models.CharField(max_length=200, blank=True, default="")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    image = models.ImageField(
        upload_to="events/%Y/%m/",
        blank=True,
        default="",
        help_text="Event banner image",
    )
    category = models.CharField(
        max_length=15,
        choices=CATEGORY_CHOICES,
        default="other",
    )
    registration_link = models.URLField(
        blank=True,
        default="",
        help_text="External registration link (if any)",
    )

    class Meta:
        verbose_name = "Event"
        verbose_name_plural = "Events"
        ordering = ["-date", "-start_time"]

    def __str__(self):
        return f"{self.title} ({self.date})"


class EventRegistration(TimeStampedModel):
    """A student's registration for an event."""

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="registrations",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_registrations",
    )

    class Meta:
        verbose_name = "Event Registration"
        verbose_name_plural = "Event Registrations"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["event", "user"],
                name="uq_event_registration",
            ),
        ]

    def __str__(self):
        return f"{self.user.username} → {self.event.title}"
