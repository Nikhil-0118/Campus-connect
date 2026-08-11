"""
CampusConnect — Lost & Found Model
=====================================
"""

from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class LostFoundItem(TimeStampedModel):
    """Represents a lost or found item reported by a student."""

    TYPE_CHOICES = (
        ("lost", "Lost"),
        ("found", "Found"),
    )

    CATEGORY_CHOICES = (
        ("electronics", "Electronics"),
        ("documents", "Documents"),
        ("accessories", "Accessories"),
        ("clothing", "Clothing"),
        ("books", "Books"),
        ("keys", "Keys"),
        ("wallet", "Wallet"),
        ("other", "Other"),
    )

    STATUS_CHOICES = (
        ("active", "Active"),
        ("claimed", "Claimed"),
        ("resolved", "Resolved"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lost_found_items",
    )
    item_type = models.CharField(
        max_length=5,
        choices=TYPE_CHOICES,
        help_text="Whether this item was lost or found",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    category = models.CharField(
        max_length=15,
        choices=CATEGORY_CHOICES,
        default="other",
    )
    image = models.ImageField(
        upload_to="lost_found/%Y/%m/",
        blank=True,
        default="",
    )
    location = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Where the item was lost/found",
    )
    date = models.DateField(
        null=True,
        blank=True,
        help_text="Date the item was lost/found",
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="active",
    )

    class Meta:
        verbose_name = "Lost/Found Item"
        verbose_name_plural = "Lost/Found Items"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_item_type_display()}] {self.title}"
