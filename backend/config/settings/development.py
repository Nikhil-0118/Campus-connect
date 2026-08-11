"""
CampusConnect — Development Settings
=====================================
Extends base settings with developer-friendly defaults:
  - DEBUG enabled
  - SQLite database (no PostgreSQL required)
  - Permissive CORS (all origins allowed)
  - Browsable API renderer enabled
"""

from .base import *  # noqa: F401, F403

# ──────────────────────────────────────────────
# Debug
# ──────────────────────────────────────────────
DEBUG = True
ALLOWED_HOSTS = ["*"]

# ──────────────────────────────────────────────
# Database — SQLite for local development
# ──────────────────────────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ──────────────────────────────────────────────
# CORS — allow everything in development
# ──────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True

# ──────────────────────────────────────────────
# DRF — add browsable API for convenience
# ──────────────────────────────────────────────
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (  # noqa: F405
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
)
