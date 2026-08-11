"""
CampusConnect — Accounts Models
================================
Core data models for the platform:
  • Department  — academic department (B.Tech, BCA, MBA, …)
  • Branch      — specialisation within a department (CS, IT, Finance, …)
  • User        — custom user extending AbstractUser with academic + profile fields

Every future module (Marketplace, Lost & Found, Events, Chat, etc.)
references the User model via `settings.AUTH_USER_MODEL`.
"""

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


# ──────────────────────────────────────────────────────
# Abstract Timestamp Mixin
# ──────────────────────────────────────────────────────

class TimeStampedModel(models.Model):
    """Abstract base that adds created_at / updated_at to any model."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ──────────────────────────────────────────────────────
# Department
# ──────────────────────────────────────────────────────

class Department(TimeStampedModel):
    """
    Represents an academic department or programme.

    Examples: B.Tech, BCA, MCA, MBA, BBA, B.Sc, BA, M.Tech, PhD
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Full department name (e.g. Bachelor of Technology)",
    )
    short_name = models.CharField(
        max_length=20,
        unique=True,
        help_text="Abbreviation (e.g. B.Tech)",
    )
    description = models.TextField(
        blank=True,
        default="",
        help_text="Optional description of the department",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Inactive departments are hidden from selection lists",
    )

    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["short_name"], name="idx_dept_short_name"),
        ]

    def __str__(self):
        return self.short_name


# ──────────────────────────────────────────────────────
# Branch
# ──────────────────────────────────────────────────────

class Branch(TimeStampedModel):
    """
    Represents a specialisation / branch within a Department.

    Examples: Computer Science, Information Technology, Finance, Marketing
    """

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="branches",
        help_text="The department this branch belongs to",
    )
    name = models.CharField(
        max_length=100,
        help_text="Full branch name (e.g. Computer Science)",
    )
    short_name = models.CharField(
        max_length=20,
        help_text="Abbreviation (e.g. CS)",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Inactive branches are hidden from selection lists",
    )

    class Meta:
        verbose_name = "Branch"
        verbose_name_plural = "Branches"
        ordering = ["department", "name"]
        # A branch name should be unique within its department
        constraints = [
            models.UniqueConstraint(
                fields=["department", "name"],
                name="uq_branch_dept_name",
            ),
            models.UniqueConstraint(
                fields=["department", "short_name"],
                name="uq_branch_dept_short_name",
            ),
        ]
        indexes = [
            models.Index(fields=["department", "name"], name="idx_branch_dept_name"),
        ]

    def __str__(self):
        return f"{self.short_name} — {self.department.short_name}"


# ──────────────────────────────────────────────────────
# Custom User
# ──────────────────────────────────────────────────────

class User(AbstractUser, TimeStampedModel):
    """
    Custom user model for CampusConnect.

    Inherits Django's full authentication system (username, email,
    password, groups, permissions) and adds academic + profile fields.

    Reference this model in other apps via:
        from django.conf import settings
        user = models.ForeignKey(settings.AUTH_USER_MODEL, ...)
    """

    # ── Personal Information ──────────────────────────

    profile_picture = models.ImageField(
        upload_to="profile_pictures/%Y/%m/",
        blank=True,
        default="",
        help_text="Profile photo (stored in media/profile_pictures/)",
    )
    bio = models.TextField(
        max_length=500,
        blank=True,
        default="",
        help_text="Short biography visible on the user's profile",
    )

    # ── Academic Information ──────────────────────────

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
        help_text="The student's academic department",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
        help_text="The student's branch / specialisation",
    )
    year = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Current year of study (1, 2, 3, 4, …)",
    )
    section = models.CharField(
        max_length=10,
        blank=True,
        default="",
        help_text="Section identifier (e.g. A, B, C)",
    )
    student_id = models.CharField(
        max_length=30,
        unique=True,
        null=True,
        blank=True,
        help_text="University-issued student ID / roll number",
    )

    # ── Contact Information ───────────────────────────

    phone_number = models.CharField(
        max_length=15,
        blank=True,
        default="",
        help_text="Phone number with country code (e.g. +91-9876543210)",
    )

    # ── Status Flags ──────────────────────────────────

    is_verified_student = models.BooleanField(
        default=False,
        help_text="Has the student verified their university identity?",
    )
    is_profile_completed = models.BooleanField(
        default=False,
        help_text="Has the student filled in all required profile fields?",
    )

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["student_id"], name="idx_user_student_id"),
            models.Index(fields=["department", "branch"], name="idx_user_dept_branch"),
        ]

    def __str__(self):
        return f"{self.username} ({self.email})"
