"""
CampusConnect — Profile Views
===============================
"""

from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated

from .models import Profile
from .serializers import ProfileSerializer, ProfileUpdateSerializer

User = get_user_model()


class MyProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/profiles/me/  — Retrieve own profile
    PATCH /api/profiles/me/ — Update own profile
    """

    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return ProfileUpdateSerializer
        return ProfileSerializer

    def get_object(self):
        # Auto-create profile if it doesn't exist yet
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class ProfileListView(generics.ListAPIView):
    """
    GET /api/profiles/

    Browse all student profiles. Supports filtering and search.

    Query params:
        - department: filter by user's department ID
        - branch: filter by user's branch ID
        - year: filter by user's year
        - search: search in username, skills, interests
    """

    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = {
        "user__department": ["exact"],
        "user__branch": ["exact"],
        "user__year": ["exact"],
    }
    search_fields = ("user__username", "user__first_name", "user__last_name")

    def get_queryset(self):
        qs = Profile.objects.select_related(
            "user", "user__department", "user__branch"
        ).all()

        # Filter by skills (JSON array contains value)
        skills = self.request.query_params.get("skills")
        if skills:
            for skill in skills.split(","):
                qs = qs.filter(skills__contains=skill.strip())

        # Filter by interests
        interests = self.request.query_params.get("interests")
        if interests:
            for interest in interests.split(","):
                qs = qs.filter(interests__contains=interest.strip())

        return qs


class ProfileDetailView(generics.RetrieveAPIView):
    """
    GET /api/profiles/<id>/

    View a specific student's profile.
    """

    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Profile.objects.select_related(
        "user", "user__department", "user__branch"
    )
