"""
CampusConnect — Profile Tests
================================
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Profile

User = get_user_model()


class ProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="StrongPass123!"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", email="other@example.com", password="StrongPass123!"
        )

    def test_my_profile_auto_creates(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/profiles/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Profile.objects.filter(user=self.user).exists())

    def test_update_profile(self):
        self.client.force_authenticate(user=self.user)
        # Auto-create profile
        self.client.get("/api/profiles/me/")
        response = self.client.patch(
            "/api/profiles/me/",
            {"skills": ["Python", "Django"], "bio": "Hello!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profile_list_requires_auth(self):
        response = self.client.get("/api/profiles/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_list_authenticated(self):
        self.client.force_authenticate(user=self.user)
        Profile.objects.get_or_create(user=self.user)
        response = self.client.get("/api/profiles/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profile_detail(self):
        self.client.force_authenticate(user=self.user)
        profile, _ = Profile.objects.get_or_create(user=self.other_user)
        response = self.client.get(f"/api/profiles/{profile.pk}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
