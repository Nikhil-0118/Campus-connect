"""
CampusConnect — Notification URLs
====================================
Included at: /api/notifications/
"""

from django.urls import path

from . import views

app_name = "notifications"

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="notification-list"),
    path("read-all/", views.MarkAllReadView.as_view(), name="mark-all-read"),
    path("<int:pk>/read/", views.MarkReadView.as_view(), name="mark-read"),
]
