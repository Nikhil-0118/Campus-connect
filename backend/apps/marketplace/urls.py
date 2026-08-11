"""
CampusConnect — Marketplace URLs
===================================
Included at: /api/marketplace/
"""

from django.urls import path

from . import views

app_name = "marketplace"

urlpatterns = [
    # Listings
    path("listings/", views.ListingListView.as_view(), name="listing-list"),
    path("listings/create/", views.ListingCreateView.as_view(), name="listing-create"),
    path("listings/<int:pk>/", views.ListingDetailView.as_view(), name="listing-detail"),
    path("listings/<int:pk>/mark-sold/", views.MarkSoldView.as_view(), name="listing-mark-sold"),
    path("listings/<int:pk>/interest/", views.CreateInterestView.as_view(), name="listing-interest"),
    path("listings/<int:pk>/interests/", views.ListingInterestsView.as_view(), name="listing-interests"),
    path("my-listings/", views.MyListingsView.as_view(), name="my-listings"),
    # Interests
    path("my-interests/", views.MyInterestsView.as_view(), name="my-interests"),
]
