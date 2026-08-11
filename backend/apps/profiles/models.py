"""
CampusConnect — Profile Model
===============================
Extends User with skills, interests, and social links.
Department/Branch/Year/Bio/ProfilePicture live on User to avoid duplication.
"""

from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class Profile(TimeStampedModel):
    """
    One-to-one extension of the User model.

    Fields that already exist on User (bio, profile_picture, department,
    branch, year) are NOT duplicated here. This model adds only the
    fields that don't belong on the core User model.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    skills = models.JSONField(
        default=list,
        blank=True,
        help_text='List of skills, e.g. ["Python", "React", "ML"]',
    )
    interests = models.JSONField(
        default=list,
        blank=True,
        help_text='List of interests, e.g. ["Web Dev", "AI", "Robotics"]',
    )
    social_links = models.JSONField(
        default=dict,
        blank=True,
        help_text='Social links, e.g. {"github": "url", "linkedin": "url"}',
    )

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Profile — {self.user.username}"
