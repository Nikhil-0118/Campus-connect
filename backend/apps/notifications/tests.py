"""
CampusConnect — Notification Tests
=====================================
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Notification
from .utils import create_notification

User = get_user_model()


class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="u1@example.com", password="StrongPass123!"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="u2@example.com", password="StrongPass123!"
        )

    def test_create_notification_util(self):
        notif = create_notification(
            recipient=self.user1,
            sender=self.user2,
            notification_type="connection_request",
            message="Test notification",
        )
        self.assertEqual(notif.recipient, self.user1)
        self.assertFalse(notif.is_read)

    def test_list_own_notifications(self):
        create_notification(
            recipient=self.user1,
            notification_type="general",
            message="Hello",
        )
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_cannot_see_other_notifications(self):
        create_notification(
            recipient=self.user1,
            notification_type="general",
            message="Secret",
        )
        self.client.force_authenticate(user=self.user2)
        response = self.client.get("/api/notifications/")
        self.assertEqual(len(response.data["results"]), 0)

    def test_mark_read(self):
        notif = create_notification(
            recipient=self.user1,
            notification_type="general",
            message="Read me",
        )
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f"/api/notifications/{notif.pk}/read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_read"])

    def test_mark_read_other_user_notification(self):
        notif = create_notification(
            recipient=self.user1,
            notification_type="general",
            message="Not yours",
        )
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f"/api/notifications/{notif.pk}/read/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_all_read(self):
        create_notification(
            recipient=self.user1, notification_type="general", message="1"
        )
        create_notification(
            recipient=self.user1, notification_type="general", message="2"
        )
        self.client.force_authenticate(user=self.user1)
        response = self.client.post("/api/notifications/read-all/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            Notification.objects.filter(recipient=self.user1, is_read=False).count(),
            0,
        )

    def test_unauthenticated_access(self):
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
