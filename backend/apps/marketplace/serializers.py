"""
CampusConnect — Marketplace Serializers
=========================================
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Listing, Interest

User = get_user_model()


class ListingSellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name")
        read_only_fields = fields


class ListingSerializer(serializers.ModelSerializer):
    seller_detail = ListingSellerSerializer(source="seller", read_only=True)

    class Meta:
        model = Listing
        fields = (
            "id",
            "seller",
            "seller_detail",
            "title",
            "description",
            "category",
            "price",
            "condition",
            "image",
            "location",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "seller", "created_at", "updated_at")

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value


class InterestSerializer(serializers.ModelSerializer):
    buyer_username = serializers.CharField(source="buyer.username", read_only=True)

    class Meta:
        model = Interest
        fields = (
            "id",
            "listing",
            "buyer",
            "buyer_username",
            "message",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "listing", "buyer", "created_at", "updated_at")
