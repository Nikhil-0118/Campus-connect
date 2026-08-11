"""
CampusConnect — Profile URLs
==============================
Included at: /api/profiles/
"""

from django.urls import path

from . import views

app_name = "profiles"

urlpatterns = [
    path("me/", views.MyProfileView.as_view(), name="my-profile"),
    path("", views.ProfileListView.as_view(), name="profile-list"),
    path("<int:pk>/", views.ProfileDetailView.as_view(), name="profile-detail"),
]
