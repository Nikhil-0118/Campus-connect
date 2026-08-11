"""
CampusConnect — Notification Utilities
=========================================
Helper function for creating notifications from other apps.
"""

from .models import Notification


def create_notification(recipient, notification_type, message, sender=None):
    """
    Create a notification for a user.

    Called from other apps' views when events happen
    (e.g., connection request, team join, marketplace interest).
    """

    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        message=message,
    )
