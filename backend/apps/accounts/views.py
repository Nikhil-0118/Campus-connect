"""
CampusConnect — Accounts Views
===============================
API views for the accounts app.
"""

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import UserRegistrationSerializer


class RegisterAPIView(generics.CreateAPIView):
    """
    POST /api/accounts/register/

    Creates a new user account.

    - Open to everyone (AllowAny) — no authentication required.
    - Returns the created user data (without password).
    - Returns 201 on success, 400 on validation errors.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Registration successful",
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
