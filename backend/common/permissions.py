"""
CampusConnect — Common Permissions
===================================
Reusable DRF permission classes.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrReadOnly(BasePermission):
    """
    Allow read access to anyone, but only the owner can modify.

    Expects the view's object to have a field matching `owner_field`
    (defaults to 'user'). Override in the view if the field name differs.
    """

    owner_field = "user"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, getattr(view, "owner_field", self.owner_field), None)
        return owner == request.user


class IsOwner(BasePermission):
    """Only the owner can access the object at all (no read for others)."""

    owner_field = "user"

    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, getattr(view, "owner_field", self.owner_field), None)
        return owner == request.user
