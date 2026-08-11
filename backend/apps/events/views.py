"""
CampusConnect — Event Views
==============================
"""

from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, EventRegistration
from .serializers import EventSerializer, EventRegistrationSerializer


class EventCreateView(generics.CreateAPIView):
    """POST /api/events/"""

    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class EventListView(generics.ListAPIView):
    """
    GET /api/events/

    Browse all events. Supports filtering and search.

    Query params:
        - upcoming=true: only show future events
        - category: filter by category
        - date: exact date filter
        - organizer: filter by organizer ID
    """

    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = {
        "category": ["exact"],
        "date": ["exact", "gte", "lte"],
        "organizer": ["exact"],
    }
    search_fields = ("title", "description", "venue")
    ordering_fields = ("date", "created_at")

    def get_queryset(self):
        qs = Event.objects.select_related("organizer").all()

        # Filter upcoming events
        upcoming = self.request.query_params.get("upcoming")
        if upcoming and upcoming.lower() == "true":
            qs = qs.filter(date__gte=timezone.now().date())

        return qs


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/events/<id>/
    PATCH /api/events/<id>/
    DELETE /api/events/<id>/
    """

    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Event.objects.select_related("organizer")

    def perform_update(self, serializer):
        if serializer.instance.organizer != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the event organizer can edit this event.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.organizer != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the event organizer can delete this event.")
        instance.delete()


class EventRegisterView(APIView):
    """POST /api/events/<id>/register/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if EventRegistration.objects.filter(event=event, user=request.user).exists():
            return Response(
                {"error": "You are already registered for this event."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration = EventRegistration.objects.create(
            event=event, user=request.user
        )

        # Notify the organizer
        try:
            from apps.notifications.utils import create_notification
            create_notification(
                recipient=event.organizer,
                sender=request.user,
                notification_type="event_registration",
                message=f"{request.user.username} registered for your event '{event.title}'.",
            )
        except ImportError:
            pass

        serializer = EventRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyEventRegistrationsView(generics.ListAPIView):
    """GET /api/events/my-registrations/"""

    serializer_class = EventRegistrationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return EventRegistration.objects.filter(
            user=self.request.user
        ).select_related("event")
