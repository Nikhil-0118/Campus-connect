"""
CampusConnect — Event Tests
==============================
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Event, EventRegistration

User = get_user_model()


class EventTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organizer = User.objects.create_user(
            username="organizer", email="org@example.com", password="StrongPass123!"
        )
        self.student = User.objects.create_user(
            username="student", email="stu@example.com", password="StrongPass123!"
        )

    def test_create_event(self):
        self.client.force_authenticate(user=self.organizer)
        data = {
            "title": "Hackathon 2026",
            "description": "Annual hackathon",
            "venue": "Auditorium",
            "date": "2026-09-15",
            "start_time": "09:00:00",
            "end_time": "18:00:00",
            "category": "hackathon",
        }
        response = self.client.post("/api/events/create/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["organizer"], self.organizer.id)

    def test_register_for_event(self):
        event = Event.objects.create(
            title="Workshop", organizer=self.organizer,
            date="2026-09-20", start_time="10:00:00",
            category="workshop"
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f"/api/events/{event.pk}/register/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_duplicate_registration_prevented(self):
        event = Event.objects.create(
            title="Workshop", organizer=self.organizer,
            date="2026-09-20", start_time="10:00:00",
            category="workshop"
        )
        self.client.force_authenticate(user=self.student)
        self.client.post(f"/api/events/{event.pk}/register/")
        response = self.client.post(f"/api/events/{event.pk}/register/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_only_organizer_can_edit(self):
        event = Event.objects.create(
            title="Workshop", organizer=self.organizer,
            date="2026-09-20", start_time="10:00:00",
            category="workshop"
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.patch(
            f"/api/events/{event.pk}/",
            {"title": "Hacked"},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_only_organizer_can_delete(self):
        event = Event.objects.create(
            title="Workshop", organizer=self.organizer,
            date="2026-09-20", start_time="10:00:00",
            category="workshop"
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.delete(f"/api/events/{event.pk}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_my_registrations(self):
        event = Event.objects.create(
            title="Event", organizer=self.organizer,
            date="2026-10-01", start_time="09:00:00",
            category="other"
        )
        EventRegistration.objects.create(event=event, user=self.student)
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/events/my-registrations/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_unauthenticated_access(self):
        response = self.client.get("/api/events/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
