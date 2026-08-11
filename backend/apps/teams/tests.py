"""
CampusConnect — Team Tests
=============================
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Team, TeamMember

User = get_user_model()


class TeamTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="creator", email="c@example.com", password="StrongPass123!"
        )
        self.user2 = User.objects.create_user(
            username="joiner", email="j@example.com", password="StrongPass123!"
        )

    def test_create_team(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "name": "Test Team",
            "description": "A test team",
            "max_members": 4,
            "hackathon_name": "HackFest 2026",
        }
        response = self.client.post("/api/teams/create/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Creator is automatically added as a member
        self.assertTrue(TeamMember.objects.filter(
            team__name="Test Team", user=self.user1, role="creator"
        ).exists())

    def test_join_team(self):
        self.client.force_authenticate(user=self.user1)
        team = Team.objects.create(
            name="Test Team", creator=self.user1, max_members=4
        )
        TeamMember.objects.create(team=team, user=self.user1, role="creator")

        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f"/api/teams/{team.pk}/join/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_join_full_team(self):
        team = Team.objects.create(
            name="Full Team", creator=self.user1, max_members=1
        )
        TeamMember.objects.create(team=team, user=self.user1, role="creator")

        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f"/api/teams/{team.pk}/join/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_team_twice(self):
        team = Team.objects.create(
            name="Test Team", creator=self.user1, max_members=4
        )
        TeamMember.objects.create(team=team, user=self.user1, role="creator")

        self.client.force_authenticate(user=self.user2)
        self.client.post(f"/api/teams/{team.pk}/join/")
        response = self.client.post(f"/api/teams/{team.pk}/join/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_closed_team(self):
        team = Team.objects.create(
            name="Closed Team", creator=self.user1, max_members=4, status="closed"
        )
        TeamMember.objects.create(team=team, user=self.user1, role="creator")

        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f"/api/teams/{team.pk}/join/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_leave_team(self):
        team = Team.objects.create(
            name="Test Team", creator=self.user1, max_members=4
        )
        TeamMember.objects.create(team=team, user=self.user1, role="creator")
        TeamMember.objects.create(team=team, user=self.user2, role="member")

        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f"/api/teams/{team.pk}/leave/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_creator_cannot_leave(self):
        team = Team.objects.create(
            name="Test Team", creator=self.user1, max_members=4
        )
        TeamMember.objects.create(team=team, user=self.user1, role="creator")

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f"/api/teams/{team.pk}/leave/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_only_creator_can_delete(self):
        team = Team.objects.create(
            name="Test Team", creator=self.user1, max_members=4
        )
        self.client.force_authenticate(user=self.user2)
        response = self.client.delete(f"/api/teams/{team.pk}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_my_teams(self):
        team = Team.objects.create(
            name="My Team", creator=self.user1, max_members=4
        )
        TeamMember.objects.create(team=team, user=self.user1, role="creator")

        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/teams/my/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_unauthenticated_access(self):
        response = self.client.get("/api/teams/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
