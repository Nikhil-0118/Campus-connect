"""
CampusConnect — Accounts Admin
===============================
Admin registrations for Department, Branch, and custom User models.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Branch, Department, User


# ──────────────────────────────────────────────────────
# Department Admin
# ──────────────────────────────────────────────────────

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "short_name", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "short_name")
    list_editable = ("is_active",)
    ordering = ("name",)


# ──────────────────────────────────────────────────────
# Branch Admin
# ──────────────────────────────────────────────────────

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("name", "department", "short_name", "is_active", "created_at")
    list_filter = ("department", "is_active")
    search_fields = ("name", "short_name")
    list_select_related = ("department",)
    ordering = ("department", "name")


# ──────────────────────────────────────────────────────
# User Admin
# ──────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Extends Django's built-in UserAdmin with CampusConnect-specific fields.
    """

    # ── List view ─────────────────────────────────────
    list_display = (
        "username",
        "email",
        "department",
        "branch",
        "year",
        "is_verified_student",
        "is_staff",
    )
    list_filter = (
        "department",
        "branch",
        "year",
        "is_verified_student",
        "is_staff",
        "is_active",
    )
    search_fields = ("username", "email", "student_id", "first_name", "last_name")
    list_select_related = ("department", "branch")
    ordering = ("-date_joined",)

    # ── Detail view fieldsets ─────────────────────────
    # Extends the default UserAdmin fieldsets with our custom fields.
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Personal Information",
            {
                "fields": ("profile_picture", "bio", "phone_number"),
            },
        ),
        (
            "Academic Information",
            {
                "fields": ("department", "branch", "year", "section", "student_id"),
            },
        ),
        (
            "Verification Status",
            {
                "fields": ("is_verified_student", "is_profile_completed"),
            },
        ),
    )

    # ── Add-user view fieldsets ───────────────────────
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            "Academic Information",
            {
                "fields": ("email", "department", "branch", "year", "student_id"),
            },
        ),
    )
