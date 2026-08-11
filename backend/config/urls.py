"""
CampusConnect — Root URL Configuration
=======================================
All app-level URL includes will be added here as the project grows.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    # ── App APIs ──────────────────────────────────────
    path("api/accounts/", include("apps.accounts.urls", namespace="accounts")),
]
