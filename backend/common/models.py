"""
CampusConnect — Common Models
==============================
Shared abstract base models used across all apps.
"""

from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base that adds created_at / updated_at to any model."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
