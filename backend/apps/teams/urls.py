"""
CampusConnect — Team URLs
===========================
Included at: /api/teams/
"""

from django.urls import path

from . import views

app_name = "teams"

urlpatterns = [
    path("", views.TeamListView.as_view(), name="team-list"),
    path("create/", views.TeamCreateView.as_view(), name="team-create"),
    path("my/", views.MyTeamsView.as_view(), name="my-teams"),
    path("<int:pk>/", views.TeamDetailView.as_view(), name="team-detail"),
    path("<int:pk>/join/", views.TeamJoinView.as_view(), name="team-join"),
    path("<int:pk>/leave/", views.TeamLeaveView.as_view(), name="team-leave"),
]
