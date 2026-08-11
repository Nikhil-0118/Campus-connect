"""
CampusConnect — Accounts Serializers
=====================================
Serializers for the accounts app.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Department, Branch

User = get_user_model()


# ──────────────────────────────────────────────────────
# Nested read-only serializers for FK display
# ──────────────────────────────────────────────────────

class DepartmentMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ("id", "name", "short_name")


class BranchMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ("id", "name", "short_name")


# ──────────────────────────────────────────────────────
# User Serializer (read-only, for /me/ and references)
# ──────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for authenticated user data.
    Never exposes password or sensitive auth fields.
    """

    department_detail = DepartmentMiniSerializer(source="department", read_only=True)
    branch_detail = BranchMiniSerializer(source="branch", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "bio",
            "department",
            "department_detail",
            "branch",
            "branch_detail",
            "year",
            "section",
            "student_id",
            "phone_number",
            "is_verified_student",
            "is_profile_completed",
            "date_joined",
        )
        read_only_fields = fields


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Handles user registration with full validation.

    Accepts:
        username, email, password, confirm_password,
        department, branch, year, student_id

    Security:
        - password is write-only (never returned in responses)
        - confirm_password is validated then discarded
        - password is hashed via User.objects.create_user()
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        help_text="Minimum 8 characters",
    )
    confirm_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        help_text="Must match the password field",
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "confirm_password",
            "department",
            "branch",
            "year",
            "student_id",
        )
        read_only_fields = ("id",)

    # ── Field-level validators ────────────────────────

    def validate_email(self, value):
        """Ensure email is unique (case-insensitive)."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value.lower()

    def validate_username(self, value):
        """Ensure username is unique (case-insensitive)."""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def validate_student_id(self, value):
        """Ensure student_id is unique."""
        if User.objects.filter(student_id=value).exists():
            raise serializers.ValidationError(
                "A user with this student ID already exists."
            )
        return value

    # ── Object-level validator ────────────────────────

    def validate(self, attrs):
        """Ensure password and confirm_password match."""
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return attrs

    # ── Create ────────────────────────────────────────

    def create(self, validated_data):
        """
        Create a new user with a properly hashed password.

        - Pops confirm_password (not a model field)
        - Uses create_user() to hash the password
        """
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )
        return user
