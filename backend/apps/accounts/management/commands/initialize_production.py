"""
CampusConnect — Initialize Production Management Command
=========================================================
Idempotent command to initialize initial production data:
  1. Creates Django superuser if environment variables are provided.
  2. Creates default initial Department (B.Tech).
  3. Creates default initial Branch (CSE) under B.Tech.

Usage:
  python manage.py initialize_production
"""

import os
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from apps.accounts.models import Department, Branch


class Command(BaseCommand):
    help = "Safely initialize production superuser and default Department/Branch data (idempotent)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("--- Running CampusConnect Production Initialization ---"))

        # ──────────────────────────────────────────────
        # 1. Superuser Creation (from env vars)
        # ──────────────────────────────────────────────
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "").strip()
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "").strip()

        if not (username and email and password):
            self.stdout.write(
                self.style.WARNING(
                    "[SKIP] Superuser creation skipped: DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, "
                    "or DJANGO_SUPERUSER_PASSWORD environment variables are missing or incomplete."
                )
            )
        else:
            User = get_user_model()
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "is_staff": True,
                    "is_superuser": True,
                },
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f"[SUCCESS] Superuser '{username}' ({email}) created successfully.")
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f"[INFO] Superuser '{username}' already exists. Password unchanged.")
                )

        # ──────────────────────────────────────────────
        # 2. Initial Department Creation (B.Tech)
        # ──────────────────────────────────────────────
        dept, dept_created = Department.objects.get_or_create(
            short_name="B.Tech",
            defaults={
                "name": "Bachelor of Technology",
                "description": "Bachelor of Technology Undergraduate Programme",
                "is_active": True,
            },
        )
        if dept_created:
            self.stdout.write(self.style.SUCCESS("[SUCCESS] Department 'B.Tech' created successfully."))
        else:
            self.stdout.write(self.style.SUCCESS("[INFO] Department 'B.Tech' already exists."))

        # ──────────────────────────────────────────────
        # 3. Initial Branch Creation (CSE under B.Tech)
        # ──────────────────────────────────────────────
        branch, branch_created = Branch.objects.get_or_create(
            department=dept,
            short_name="CSE",
            defaults={
                "name": "Computer Science and Engineering",
                "is_active": True,
            },
        )
        if branch_created:
            self.stdout.write(self.style.SUCCESS("[SUCCESS] Branch 'CSE' (B.Tech) created successfully."))
        else:
            self.stdout.write(self.style.SUCCESS("[INFO] Branch 'CSE' (B.Tech) already exists."))

        self.stdout.write(self.style.MIGRATE_HEADING("--- Production Initialization Completed ---"))
