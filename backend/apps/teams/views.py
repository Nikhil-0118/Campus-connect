"""
CampusConnect — Team Views
============================
"""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Team, TeamMember
from .serializers import TeamSerializer


class TeamCreateView(generics.CreateAPIView):
    """POST /api/teams/"""

    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        team = serializer.save(creator=self.request.user)
        # Auto-add creator as a team member
        TeamMember.objects.create(
            team=team, user=self.request.user, role="creator"
        )


class TeamListView(generics.ListAPIView):
    """
    GET /api/teams/

    Browse all teams. Supports filtering and search.
    """

    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = {"status": ["exact"]}
    search_fields = ("name", "description", "hackathon_name")

    def get_queryset(self):
        qs = Team.objects.select_related("creator").prefetch_related(
            "members__user"
        ).all()

        # Filter by required skills
        skills = self.request.query_params.get("skills")
        if skills:
            for skill in skills.split(","):
                qs = qs.filter(required_skills__contains=skill.strip())

        # Filter by department (creator's department)
        department = self.request.query_params.get("department")
        if department:
            qs = qs.filter(creator__department_id=department)

        # Filter by branch (creator's branch)
        branch = self.request.query_params.get("branch")
        if branch:
            qs = qs.filter(creator__branch_id=branch)

        # Filter by availability (teams that aren't full)
        available = self.request.query_params.get("available")
        if available and available.lower() == "true":
            qs = [t for t in qs if not t.is_full and t.status == "open"]
            return Team.objects.filter(pk__in=[t.pk for t in qs])

        return qs


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/teams/<id>/
    PATCH /api/teams/<id>/
    DELETE /api/teams/<id>/

    Only the creator can update or delete.
    """

    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Team.objects.select_related("creator").prefetch_related("members__user")

    def perform_update(self, serializer):
        if serializer.instance.creator != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the team creator can edit this team.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.creator != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the team creator can delete this team.")
        instance.delete()


class TeamJoinView(APIView):
    """POST /api/teams/<id>/join/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        try:
            team = Team.objects.get(pk=pk)
        except Team.DoesNotExist:
            return Response(
                {"error": "Team not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if team.status != "open":
            return Response(
                {"error": "This team is not accepting new members."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if team.is_full:
            return Response(
                {"error": "This team is already full."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if TeamMember.objects.filter(team=team, user=request.user).exists():
            return Response(
                {"error": "You are already a member of this team."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        TeamMember.objects.create(team=team, user=request.user, role="member")

        # Notify the creator
        try:
            from apps.notifications.utils import create_notification
            create_notification(
                recipient=team.creator,
                sender=request.user,
                notification_type="team_join",
                message=f"{request.user.username} joined your team '{team.name}'.",
            )
        except ImportError:
            pass

        serializer = TeamSerializer(team)
        return Response(serializer.data)


class TeamLeaveView(APIView):
    """POST /api/teams/<id>/leave/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        try:
            team = Team.objects.get(pk=pk)
        except Team.DoesNotExist:
            return Response(
                {"error": "Team not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            membership = TeamMember.objects.get(team=team, user=request.user)
        except TeamMember.DoesNotExist:
            return Response(
                {"error": "You are not a member of this team."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if membership.role == "creator":
            return Response(
                {"error": "The team creator cannot leave. Delete the team instead."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership.delete()
        return Response({"message": "You have left the team."})


class MyTeamsView(generics.ListAPIView):
    """
    GET /api/teams/my/

    List teams the authenticated user is a member of.
    """

    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Team.objects.filter(
            members__user=self.request.user
        ).select_related("creator").prefetch_related("members__user")
