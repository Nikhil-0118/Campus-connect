"""
CampusConnect — Accounts Views
===============================
API views for the accounts app.
"""

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Department, Branch
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    DepartmentMiniSerializer,
    BranchMiniSerializer,
)


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


class MeAPIView(generics.RetrieveAPIView):
    """
    GET /api/accounts/me/

    Returns the authenticated user's own data.
    Requires JWT authentication.
    """

    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class DepartmentListView(generics.ListAPIView):
    """
    GET /api/accounts/departments/

    Returns all active departments.
    Open to everyone (needed for registration form).
    """

    serializer_class = DepartmentMiniSerializer
    permission_classes = (AllowAny,)
    pagination_class = None

    def get_queryset(self):
        return Department.objects.filter(is_active=True)


class BranchListView(generics.ListAPIView):
    """
    GET /api/accounts/branches/?department=<id>

    Returns all active branches, optionally filtered by department.
    Open to everyone (needed for registration form).
    """

    serializer_class = BranchMiniSerializer
    permission_classes = (AllowAny,)
    pagination_class = None

    def get_queryset(self):
        qs = Branch.objects.filter(is_active=True).select_related("department")
        department_id = self.request.query_params.get("department")
        if department_id:
            qs = qs.filter(department_id=department_id)
        return qs

