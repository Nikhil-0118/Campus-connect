"""
CampusConnect — Lost & Found URLs
====================================
Included at: /api/lost-found/
"""

from django.urls import path

from . import views

app_name = "lost_found"

urlpatterns = [
    path("", views.LostFoundListView.as_view(), name="lostfound-list"),
    path("create/", views.LostFoundCreateView.as_view(), name="lostfound-create"),
    path("my/", views.MyLostFoundView.as_view(), name="my-lostfound"),
    path("<int:pk>/", views.LostFoundDetailView.as_view(), name="lostfound-detail"),
    path("<int:pk>/resolve/", views.LostFoundResolveView.as_view(), name="lostfound-resolve"),
    path("<int:pk>/matches/", views.LostFoundMatchView.as_view(), name="lostfound-matches"),
]
