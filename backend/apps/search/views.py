"""
CampusConnect — Unified Search View
======================================
Searches across profiles, teams, listings, lost/found items, and events.
"""

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.profiles.models import Profile
from apps.profiles.serializers import ProfileSerializer
from apps.teams.models import Team
from apps.teams.serializers import TeamSerializer
from apps.marketplace.models import Listing
from apps.marketplace.serializers import ListingSerializer
from apps.lost_found.models import LostFoundItem
from apps.lost_found.serializers import LostFoundItemSerializer
from apps.events.models import Event
from apps.events.serializers import EventSerializer

User = get_user_model()


class UnifiedSearchView(APIView):
    """
    GET /api/search/?q=<query>

    Searches across multiple models and returns categorised results.
    Optional query param `type` can limit search to a specific category:
      profiles, teams, listings, lost_found, events
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        search_type = request.query_params.get("type", "").strip()

        if not query:
            return Response({"error": "Please provide a search query using ?q=..."}, status=400)

        results = {}
        limit = 10  # Max results per category

        # Profiles
        if not search_type or search_type == "profiles":
            profiles = Profile.objects.filter(
                Q(user__username__icontains=query) |
                Q(user__first_name__icontains=query) |
                Q(user__last_name__icontains=query) |
                Q(skills__contains=query) |
                Q(interests__contains=query)
            ).select_related("user", "user__department", "user__branch")[:limit]
            results["profiles"] = ProfileSerializer(profiles, many=True).data

        # Teams
        if not search_type or search_type == "teams":
            teams = Team.objects.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(hackathon_name__icontains=query) |
                Q(required_skills__contains=query)
            ).select_related("creator").prefetch_related("members__user")[:limit]
            results["teams"] = TeamSerializer(teams, many=True).data

        # Marketplace listings
        if not search_type or search_type == "listings":
            listings = Listing.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query)
            ).select_related("seller")[:limit]
            results["listings"] = ListingSerializer(listings, many=True).data

        # Lost & Found
        if not search_type or search_type == "lost_found":
            items = LostFoundItem.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(location__icontains=query)
            ).select_related("user")[:limit]
            results["lost_found"] = LostFoundItemSerializer(items, many=True).data

        # Events
        if not search_type or search_type == "events":
            events = Event.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(venue__icontains=query)
            ).select_related("organizer")[:limit]
            results["events"] = EventSerializer(events, many=True).data

        return Response(results)
