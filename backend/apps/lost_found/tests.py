"""
CampusConnect — Lost & Found Tests
=====================================
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import LostFoundItem

User = get_user_model()


class LostFoundTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="u1@example.com", password="StrongPass123!"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="u2@example.com", password="StrongPass123!"
        )

    def test_create_lost_item(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "item_type": "lost",
            "title": "Blue Backpack",
            "description": "Lost near library",
            "category": "accessories",
            "location": "Main Library",
        }
        response = self.client.post("/api/lost-found/create/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["item_type"], "lost")

    def test_create_found_item(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "item_type": "found",
            "title": "USB Drive",
            "category": "electronics",
            "location": "Computer Lab",
        }
        response = self.client.post("/api/lost-found/create/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_only_owner_can_edit(self):
        item = LostFoundItem.objects.create(
            user=self.user1, item_type="lost", title="Keys", category="keys"
        )
        self.client.force_authenticate(user=self.user2)
        response = self.client.patch(
            f"/api/lost-found/{item.pk}/",
            {"title": "Hacked"},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_only_owner_can_delete(self):
        item = LostFoundItem.objects.create(
            user=self.user1, item_type="found", title="Wallet", category="wallet"
        )
        self.client.force_authenticate(user=self.user2)
        response = self.client.delete(f"/api/lost-found/{item.pk}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_resolve_item(self):
        item = LostFoundItem.objects.create(
            user=self.user1, item_type="lost", title="Phone", category="electronics"
        )
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f"/api/lost-found/{item.pk}/resolve/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "resolved")

    def test_resolve_by_non_owner(self):
        item = LostFoundItem.objects.create(
            user=self.user1, item_type="lost", title="Phone", category="electronics"
        )
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f"/api/lost-found/{item.pk}/resolve/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_matching(self):
        LostFoundItem.objects.create(
            user=self.user1, item_type="lost", title="Blue Backpack",
            category="accessories", location="Library"
        )
        found = LostFoundItem.objects.create(
            user=self.user2, item_type="found", title="Blue Bag",
            category="accessories", location="Library"
        )
        self.client.force_authenticate(user=self.user1)
        lost = LostFoundItem.objects.get(user=self.user1)
        response = self.client.get(f"/api/lost-found/{lost.pk}/matches/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should find the found item as a match
        self.assertGreaterEqual(len(response.data), 1)

    def test_my_items(self):
        LostFoundItem.objects.create(
            user=self.user1, item_type="lost", title="Book", category="books"
        )
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/lost-found/my/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_unauthenticated_access(self):
        response = self.client.get("/api/lost-found/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
