"""
CampusConnect — Root URL Configuration
=======================================
All app-level URL includes will be added here as the project grows.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    # ── App APIs ──────────────────────────────────────
    path("api/accounts/", include("apps.accounts.urls", namespace="accounts")),
    path("api/profiles/", include("apps.profiles.urls", namespace="profiles")),
    path("api/connections/", include("apps.connections.urls", namespace="connections")),
    path("api/teams/", include("apps.teams.urls", namespace="teams")),
    path("api/marketplace/", include("apps.marketplace.urls", namespace="marketplace")),
    path("api/lost-found/", include("apps.lost_found.urls", namespace="lost_found")),
    path("api/events/", include("apps.events.urls", namespace="events")),
    path("api/notifications/", include("apps.notifications.urls", namespace="notifications")),
    path("api/search/", include("apps.search.urls", namespace="search")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
