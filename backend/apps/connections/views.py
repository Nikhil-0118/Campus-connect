"""
CampusConnect — Connection Views
==================================
"""

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Connection
from .serializers import ConnectionSerializer

User = get_user_model()


class SendConnectionView(APIView):
    """POST /api/connections/<user_id>/send/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request, user_id):
        if request.user.id == user_id:
            return Response(
                {"error": "You cannot send a connection request to yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            receiver = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check for existing connection in either direction
        existing = Connection.objects.filter(
            (Q(sender=request.user, receiver=receiver) |
             Q(sender=receiver, receiver=request.user)),
            status__in=["pending", "accepted"],
        ).first()

        if existing:
            return Response(
                {"error": "A connection already exists between you and this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        connection = Connection.objects.create(
            sender=request.user,
            receiver=receiver,
            status="pending",
        )

        # Create notification for the receiver
        try:
            from apps.notifications.utils import create_notification
            create_notification(
                recipient=receiver,
                sender=request.user,
                notification_type="connection_request",
                message=f"{request.user.username} sent you a connection request.",
            )
        except ImportError:
            pass

        serializer = ConnectionSerializer(connection)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AcceptConnectionView(APIView):
    """POST /api/connections/<user_id>/accept/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request, user_id):
        try:
            connection = Connection.objects.get(
                sender_id=user_id,
                receiver=request.user,
                status="pending",
            )
        except Connection.DoesNotExist:
            return Response(
                {"error": "No pending connection request found from this user."},
                status=status.HTTP_404_NOT_FOUND,
            )

        connection.status = "accepted"
        connection.save()

        # Notify the sender
        try:
            from apps.notifications.utils import create_notification
            create_notification(
                recipient=connection.sender,
                sender=request.user,
                notification_type="connection_accepted",
                message=f"{request.user.username} accepted your connection request.",
            )
        except ImportError:
            pass

        serializer = ConnectionSerializer(connection)
        return Response(serializer.data)


class RejectConnectionView(APIView):
    """POST /api/connections/<user_id>/reject/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request, user_id):
        try:
            connection = Connection.objects.get(
                sender_id=user_id,
                receiver=request.user,
                status="pending",
            )
        except Connection.DoesNotExist:
            return Response(
                {"error": "No pending connection request found from this user."},
                status=status.HTTP_404_NOT_FOUND,
            )

        connection.status = "rejected"
        connection.save()

        serializer = ConnectionSerializer(connection)
        return Response(serializer.data)


class ConnectionListView(generics.ListAPIView):
    """
    GET /api/connections/

    List all accepted connections for the authenticated user.
    """

    serializer_class = ConnectionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return Connection.objects.filter(
            Q(sender=user) | Q(receiver=user),
            status="accepted",
        ).select_related("sender", "receiver")


class ConnectionRequestListView(generics.ListAPIView):
    """
    GET /api/connections/requests/

    List all pending connection requests received by the authenticated user.
    """

    serializer_class = ConnectionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Connection.objects.filter(
            receiver=self.request.user,
            status="pending",
        ).select_related("sender", "receiver")
