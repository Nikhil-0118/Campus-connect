"""
CampusConnect — Event URLs
=============================
Included at: /api/events/
"""

from django.urls import path

from . import views

app_name = "events"

urlpatterns = [
    path("", views.EventListView.as_view(), name="event-list"),
    path("create/", views.EventCreateView.as_view(), name="event-create"),
    path("my-registrations/", views.MyEventRegistrationsView.as_view(), name="my-registrations"),
    path("<int:pk>/", views.EventDetailView.as_view(), name="event-detail"),
    path("<int:pk>/register/", views.EventRegisterView.as_view(), name="event-register"),
]
