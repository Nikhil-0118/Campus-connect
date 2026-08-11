"""
CampusConnect — Lost & Found Views
=====================================
"""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .matching import find_matches
from .models import LostFoundItem
from .serializers import LostFoundItemSerializer, LostFoundMatchSerializer


class LostFoundCreateView(generics.CreateAPIView):
    """POST /api/lost-found/"""

    serializer_class = LostFoundItemSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LostFoundListView(generics.ListAPIView):
    """
    GET /api/lost-found/

    Browse all lost/found items. Supports filtering and search.
    """

    serializer_class = LostFoundItemSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = {
        "item_type": ["exact"],
        "category": ["exact"],
        "status": ["exact"],
        "date": ["exact", "gte", "lte"],
    }
    search_fields = ("title", "description", "location")

    def get_queryset(self):
        return LostFoundItem.objects.select_related("user").all()


class LostFoundDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/lost-found/<id>/
    PATCH /api/lost-found/<id>/
    DELETE /api/lost-found/<id>/
    """

    serializer_class = LostFoundItemSerializer
    permission_classes = (IsAuthenticated,)
    queryset = LostFoundItem.objects.select_related("user")

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own posts.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own posts.")
        instance.delete()


class LostFoundResolveView(APIView):
    """POST /api/lost-found/<id>/resolve/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        try:
            item = LostFoundItem.objects.get(pk=pk)
        except LostFoundItem.DoesNotExist:
            return Response(
                {"error": "Item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if item.user != request.user:
            return Response(
                {"error": "You can only resolve your own posts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        item.status = "resolved"
        item.save()

        serializer = LostFoundItemSerializer(item)
        return Response(serializer.data)


class MyLostFoundView(generics.ListAPIView):
    """GET /api/lost-found/my/"""

    serializer_class = LostFoundItemSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return LostFoundItem.objects.filter(user=self.request.user)


class LostFoundMatchView(APIView):
    """
    GET /api/lost-found/<id>/matches/

    Find potential matches for a lost/found item.
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        try:
            item = LostFoundItem.objects.get(pk=pk)
        except LostFoundItem.DoesNotExist:
            return Response(
                {"error": "Item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        matches = find_matches(item)

        # Notify item owner about matches
        if matches:
            try:
                from apps.notifications.utils import create_notification
                create_notification(
                    recipient=item.user,
                    notification_type="lost_found_match",
                    message=f"We found {len(matches)} potential match(es) for your {item.get_item_type_display().lower()} item '{item.title}'.",
                )
            except ImportError:
                pass

        serializer = LostFoundMatchSerializer(matches, many=True)
        return Response(serializer.data)
