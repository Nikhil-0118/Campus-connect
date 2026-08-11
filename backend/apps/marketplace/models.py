"""
CampusConnect — Marketplace Models
=====================================
Campus marketplace for buying/selling used college materials.
"""

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from common.models import TimeStampedModel


class Listing(TimeStampedModel):
    """A marketplace listing for selling used items."""

    CATEGORY_CHOICES = (
        ("books", "Books"),
        ("notes", "Notes"),
        ("electronics", "Electronics"),
        ("calculators", "Calculators"),
        ("lab_equipment", "Lab Equipment"),
        ("college_materials", "College Materials"),
        ("other", "Other"),
    )

    CONDITION_CHOICES = (
        ("new", "New"),
        ("like_new", "Like New"),
        ("good", "Good"),
        ("fair", "Fair"),
        ("poor", "Poor"),
    )

    STATUS_CHOICES = (
        ("available", "Available"),
        ("sold", "Sold"),
        ("reserved", "Reserved"),
    )

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="listings",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price in INR",
    )
    condition = models.CharField(
        max_length=10,
        choices=CONDITION_CHOICES,
        default="good",
    )
    image = models.ImageField(
        upload_to="marketplace/%Y/%m/",
        blank=True,
        default="",
    )
    location = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Where the item can be picked up",
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="available",
    )

    class Meta:
        verbose_name = "Listing"
        verbose_name_plural = "Listings"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} — ₹{self.price}"


class Interest(TimeStampedModel):
    """A buyer's interest in a marketplace listing."""

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="interests",
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="marketplace_interests",
    )
    message = models.TextField(
        blank=True,
        default="",
        help_text="Message to the seller",
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending",
    )

    class Meta:
        verbose_name = "Interest"
        verbose_name_plural = "Interests"
        ordering = ["-created_at"]
        # Prevent duplicate active interests on the same listing
        constraints = [
            models.UniqueConstraint(
                fields=["listing", "buyer"],
                condition=models.Q(status__in=["pending", "accepted"]),
                name="uq_active_interest_listing_buyer",
            ),
        ]

    def __str__(self):
        return f"{self.buyer.username} → {self.listing.title} ({self.status})"
