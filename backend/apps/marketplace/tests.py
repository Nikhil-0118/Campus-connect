"""
CampusConnect — Marketplace Tests
====================================
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Listing, Interest

User = get_user_model()


class ListingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = User.objects.create_user(
            username="seller", email="seller@example.com", password="StrongPass123!"
        )
        self.buyer = User.objects.create_user(
            username="buyer", email="buyer@example.com", password="StrongPass123!"
        )

    def test_create_listing(self):
        self.client.force_authenticate(user=self.seller)
        data = {
            "title": "Calculus Textbook",
            "description": "Barely used",
            "category": "books",
            "price": "250.00",
            "condition": "good",
        }
        response = self.client.post("/api/marketplace/listings/create/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["seller"], self.seller.id)

    def test_listing_list(self):
        self.client.force_authenticate(user=self.buyer)
        Listing.objects.create(
            seller=self.seller, title="Book", category="books",
            price=100, condition="good"
        )
        response = self.client.get("/api/marketplace/listings/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_only_seller_can_edit(self):
        listing = Listing.objects.create(
            seller=self.seller, title="Book", category="books",
            price=100, condition="good"
        )
        self.client.force_authenticate(user=self.buyer)
        response = self.client.patch(
            f"/api/marketplace/listings/{listing.pk}/",
            {"title": "Hacked"},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_only_seller_can_delete(self):
        listing = Listing.objects.create(
            seller=self.seller, title="Book", category="books",
            price=100, condition="good"
        )
        self.client.force_authenticate(user=self.buyer)
        response = self.client.delete(f"/api/marketplace/listings/{listing.pk}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mark_sold(self):
        listing = Listing.objects.create(
            seller=self.seller, title="Book", category="books",
            price=100, condition="good"
        )
        self.client.force_authenticate(user=self.seller)
        response = self.client.post(f"/api/marketplace/listings/{listing.pk}/mark-sold/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "sold")

    def test_mark_sold_by_non_seller(self):
        listing = Listing.objects.create(
            seller=self.seller, title="Book", category="books",
            price=100, condition="good"
        )
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(f"/api/marketplace/listings/{listing.pk}/mark-sold/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class InterestTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = User.objects.create_user(
            username="seller", email="seller@example.com", password="StrongPass123!"
        )
        self.buyer = User.objects.create_user(
            username="buyer", email="buyer@example.com", password="StrongPass123!"
        )
        self.listing = Listing.objects.create(
            seller=self.seller, title="Calculator", category="calculators",
            price=500, condition="good"
        )

    def test_express_interest(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(
            f"/api/marketplace/listings/{self.listing.pk}/interest/",
            {"message": "I'm interested!"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_cannot_interest_own_listing(self):
        self.client.force_authenticate(user=self.seller)
        response = self.client.post(
            f"/api/marketplace/listings/{self.listing.pk}/interest/",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_interest_prevented(self):
        self.client.force_authenticate(user=self.buyer)
        self.client.post(f"/api/marketplace/listings/{self.listing.pk}/interest/")
        response = self.client.post(
            f"/api/marketplace/listings/{self.listing.pk}/interest/"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_seller_sees_interests(self):
        Interest.objects.create(listing=self.listing, buyer=self.buyer, message="Hi")
        self.client.force_authenticate(user=self.seller)
        response = self.client.get(
            f"/api/marketplace/listings/{self.listing.pk}/interests/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_non_seller_cannot_see_interests(self):
        Interest.objects.create(listing=self.listing, buyer=self.buyer, message="Hi")
        other = User.objects.create_user(
            username="other", email="o@o.com", password="StrongPass123!"
        )
        self.client.force_authenticate(user=other)
        response = self.client.get(
            f"/api/marketplace/listings/{self.listing.pk}/interests/"
        )
        # Returns empty list (no interests belong to this user's listings)
        self.assertEqual(len(response.data["results"]), 0)

    def test_interest_on_sold_listing(self):
        self.listing.status = "sold"
        self.listing.save()
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post(
            f"/api/marketplace/listings/{self.listing.pk}/interest/"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
