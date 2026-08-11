"""
CampusConnect — Team Models
==============================
Team/hackathon/project finder system.
"""

from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class Team(TimeStampedModel):
    """A hackathon/project team that students can create and join."""

    STATUS_CHOICES = (
        ("open", "Open"),
        ("closed", "Closed"),
        ("completed", "Completed"),
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_teams",
    )
    project_description = models.TextField(
        blank=True,
        default="",
        help_text="Detailed description of the project or hackathon entry",
    )
    required_skills = models.JSONField(
        default=list,
        blank=True,
        help_text='Skills needed, e.g. ["Python", "React", "UI/UX"]',
    )
    max_members = models.PositiveIntegerField(
        default=4,
        help_text="Maximum number of team members",
    )
    hackathon_name = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Name of the hackathon or project",
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="open",
    )

    class Meta:
        verbose_name = "Team"
        verbose_name_plural = "Teams"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def current_member_count(self):
        return self.members.count()

    @property
    def is_full(self):
        return self.current_member_count >= self.max_members


class TeamMember(TimeStampedModel):
    """Through model for team membership."""

    ROLE_CHOICES = (
        ("creator", "Creator"),
        ("member", "Member"),
    )

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="members",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="team_memberships",
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="member",
    )

    class Meta:
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"
        constraints = [
            models.UniqueConstraint(
                fields=["team", "user"],
                name="uq_team_member",
            ),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.team.name} ({self.role})"
