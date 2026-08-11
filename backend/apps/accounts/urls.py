"""
CampusConnect — Accounts URLs
==============================
URL patterns for the accounts app.

Included in the root URL conf at: /api/accounts/
"""

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.RegisterAPIView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.MeAPIView.as_view(), name="me"),
]
