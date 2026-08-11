"""
CampusConnect — Search URLs
==============================
Included at: /api/search/
"""

from django.urls import path

from . import views

app_name = "search"

urlpatterns = [
    path("", views.UnifiedSearchView.as_view(), name="unified-search"),
]
