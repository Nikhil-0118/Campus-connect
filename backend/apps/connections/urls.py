"""
CampusConnect — Connection URLs
=================================
Included at: /api/connections/
"""

from django.urls import path

from . import views

app_name = "connections"

urlpatterns = [
    path("", views.ConnectionListView.as_view(), name="connection-list"),
    path("requests/", views.ConnectionRequestListView.as_view(), name="connection-requests"),
    path("<int:user_id>/send/", views.SendConnectionView.as_view(), name="send-connection"),
    path("<int:user_id>/accept/", views.AcceptConnectionView.as_view(), name="accept-connection"),
    path("<int:user_id>/reject/", views.RejectConnectionView.as_view(), name="reject-connection"),
]
