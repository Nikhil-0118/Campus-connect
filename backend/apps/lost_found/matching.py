"""
CampusConnect — Lost & Found Matching Engine
===============================================
Rule-based matching between LOST and FOUND items.

This module is designed to be modular — the matching logic can be
replaced with AI/image-based matching later without changing the API.
"""

from difflib import SequenceMatcher


def calculate_match_score(item_a, item_b):
    """
    Calculate a match score (0–100) between two LostFoundItems.

    Scoring criteria:
    - Category match: 40 points
    - Title/description text similarity: 40 points
    - Location match: 20 points
    """

    score = 0

    # Category match (40 points)
    if item_a.category == item_b.category:
        score += 40

    # Title + description text similarity (40 points)
    text_a = f"{item_a.title} {item_a.description}".lower()
    text_b = f"{item_b.title} {item_b.description}".lower()
    text_similarity = SequenceMatcher(None, text_a, text_b).ratio()
    score += int(text_similarity * 40)

    # Location match (20 points)
    if item_a.location and item_b.location:
        loc_similarity = SequenceMatcher(
            None, item_a.location.lower(), item_b.location.lower()
        ).ratio()
        score += int(loc_similarity * 20)

    return score


def find_matches(item, min_score=20, max_results=10):
    """
    Find potential matches for a given LostFoundItem.

    If the item is LOST, search among FOUND items, and vice versa.
    Returns a list of (item, score) tuples sorted by score descending.
    """

    from .models import LostFoundItem

    # Search the opposite type
    opposite_type = "found" if item.item_type == "lost" else "lost"

    candidates = LostFoundItem.objects.filter(
        item_type=opposite_type,
        status="active",
    ).exclude(pk=item.pk)

    matches = []
    for candidate in candidates:
        score = calculate_match_score(item, candidate)
        if score >= min_score:
            matches.append({"item": candidate, "score": score})

    # Sort by score descending
    matches.sort(key=lambda m: m["score"], reverse=True)

    return matches[:max_results]
