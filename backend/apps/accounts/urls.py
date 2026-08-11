"""
CampusConnect — Accounts URLs
==============================
URL patterns for the accounts app.

Included in the root URL conf at: /api/accounts/
"""

from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.RegisterAPIView.as_view(), name="register"),
]
