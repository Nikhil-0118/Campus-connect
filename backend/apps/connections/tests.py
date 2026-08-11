"""
CampusConnect — Connection Tests
===================================
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Connection

User = get_user_model()


class ConnectionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="u1@example.com", password="StrongPass123!"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="u2@example.com", password="StrongPass123!"
        )

    def test_send_connection_request(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f"/api/connections/{self.user2.id}/send/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "pending")

    def test_cannot_connect_to_self(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f"/api/connections/{self.user1.id}/send/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_connection_prevented(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post(f"/api/connections/{self.user2.id}/send/")
        response = self.client.post(f"/api/connections/{self.user2.id}/send/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_accept_connection(self):
        Connection.objects.create(sender=self.user1, receiver=self.user2, status="pending")
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f"/api/connections/{self.user1.id}/accept/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "accepted")

    def test_only_receiver_can_accept(self):
        Connection.objects.create(sender=self.user1, receiver=self.user2, status="pending")
        self.client.force_authenticate(user=self.user1)  # Sender trying to accept
        response = self.client.post(f"/api/connections/{self.user1.id}/accept/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_reject_connection(self):
        Connection.objects.create(sender=self.user1, receiver=self.user2, status="pending")
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f"/api/connections/{self.user1.id}/reject/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "rejected")

    def test_list_accepted_connections(self):
        Connection.objects.create(sender=self.user1, receiver=self.user2, status="accepted")
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/connections/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_list_pending_requests(self):
        Connection.objects.create(sender=self.user1, receiver=self.user2, status="pending")
        self.client.force_authenticate(user=self.user2)
        response = self.client.get("/api/connections/requests/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_connection_to_nonexistent_user(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post("/api/connections/9999/send/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_access(self):
        response = self.client.get("/api/connections/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
