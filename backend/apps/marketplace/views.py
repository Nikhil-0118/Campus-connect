"""
CampusConnect — Marketplace Views
====================================
"""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Listing, Interest
from .serializers import ListingSerializer, InterestSerializer


# ──────────────────────────────────────────────────────
# Listing Views
# ──────────────────────────────────────────────────────

class ListingCreateView(generics.CreateAPIView):
    """POST /api/marketplace/listings/"""

    serializer_class = ListingSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class ListingListView(generics.ListAPIView):
    """
    GET /api/marketplace/listings/

    Browse all available listings. Supports filtering and search.
    """

    serializer_class = ListingSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = {
        "category": ["exact"],
        "condition": ["exact"],
        "status": ["exact"],
        "price": ["gte", "lte"],
    }
    search_fields = ("title", "description")
    ordering_fields = ("price", "created_at")

    def get_queryset(self):
        return Listing.objects.select_related("seller").all()


class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/marketplace/listings/<id>/
    PATCH /api/marketplace/listings/<id>/
    DELETE /api/marketplace/listings/<id>/
    """

    serializer_class = ListingSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Listing.objects.select_related("seller")

    def perform_update(self, serializer):
        if serializer.instance.seller != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the seller can edit this listing.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.seller != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the seller can delete this listing.")
        instance.delete()


class MarkSoldView(APIView):
    """POST /api/marketplace/listings/<id>/mark-sold/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if listing.seller != request.user:
            return Response(
                {"error": "Only the seller can mark this listing as sold."},
                status=status.HTTP_403_FORBIDDEN,
            )

        listing.status = "sold"
        listing.save()

        serializer = ListingSerializer(listing)
        return Response(serializer.data)


class MyListingsView(generics.ListAPIView):
    """GET /api/marketplace/my-listings/"""

    serializer_class = ListingSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Listing.objects.filter(seller=self.request.user)


# ──────────────────────────────────────────────────────
# Interest Views
# ──────────────────────────────────────────────────────

class CreateInterestView(APIView):
    """POST /api/marketplace/listings/<id>/interest/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if listing.seller == request.user:
            return Response(
                {"error": "You cannot express interest in your own listing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if listing.status != "available":
            return Response(
                {"error": "This listing is no longer available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for existing active interest
        if Interest.objects.filter(
            listing=listing,
            buyer=request.user,
            status__in=["pending", "accepted"],
        ).exists():
            return Response(
                {"error": "You already have an active interest on this listing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        interest = Interest.objects.create(
            listing=listing,
            buyer=request.user,
            message=request.data.get("message", ""),
        )

        # Notify the seller
        try:
            from apps.notifications.utils import create_notification
            create_notification(
                recipient=listing.seller,
                sender=request.user,
                notification_type="marketplace_interest",
                message=f"{request.user.username} is interested in your listing '{listing.title}'.",
            )
        except ImportError:
            pass

        serializer = InterestSerializer(interest)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyInterestsView(generics.ListAPIView):
    """GET /api/marketplace/my-interests/"""

    serializer_class = InterestSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Interest.objects.filter(
            buyer=self.request.user
        ).select_related("listing", "buyer")


class ListingInterestsView(generics.ListAPIView):
    """
    GET /api/marketplace/listings/<id>/interests/

    Only the seller can see interests on their listing.
    """

    serializer_class = InterestSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Interest.objects.filter(
            listing_id=self.kwargs["pk"],
            listing__seller=self.request.user,
        ).select_related("buyer")
