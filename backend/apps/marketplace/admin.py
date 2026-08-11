"""
CampusConnect — Marketplace Admin
====================================
"""

from django.contrib import admin

from .models import Listing, Interest


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "seller", "category", "price", "condition", "status", "created_at")
    list_filter = ("category", "condition", "status")
    search_fields = ("title", "description", "seller__username")
    list_select_related = ("seller",)
    raw_id_fields = ("seller",)


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ("buyer", "listing", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("buyer__username", "listing__title")
    list_select_related = ("buyer", "listing")
    raw_id_fields = ("buyer", "listing")
