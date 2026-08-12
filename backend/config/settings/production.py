"""
CampusConnect — Production Settings
====================================
Extends base settings with production-hardened defaults:
  - DEBUG disabled
  - PostgreSQL database via DATABASE_URL
  - WhiteNoise for static file serving
  - Strict CORS (explicit origin allowlist)
  - Security headers enabled
"""

import os

import dj_database_url

from .base import *  # noqa: F401, F403

# ──────────────────────────────────────────────
# Debug
# ──────────────────────────────────────────────
DEBUG = False
ALLOWED_HOSTS = [
    h.strip() for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h.strip()
]

# ──────────────────────────────────────────────
# Database — PostgreSQL via DATABASE_URL
# ──────────────────────────────────────────────
# Render provides a single DATABASE_URL env var for its managed PostgreSQL.
# dj-database-url parses it into the DATABASES dict Django expects.
DATABASES = {
    "default": dj_database_url.config(
        default="sqlite:///db.sqlite3",
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# ──────────────────────────────────────────────
# Static Files — WhiteNoise
# ──────────────────────────────────────────────
# Insert WhiteNoise right after SecurityMiddleware so it can serve
# collected static files without nginx or a CDN.
MIDDLEWARE.insert(  # noqa: F405
    MIDDLEWARE.index("django.middleware.security.SecurityMiddleware") + 1,  # noqa: F405
    "whitenoise.middleware.WhiteNoiseMiddleware",
)
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ──────────────────────────────────────────────
# CORS — explicit allowlist
# ──────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if o.strip()
]

# Allow credentials (cookies / Authorization header) across origins
CORS_ALLOW_CREDENTIALS = True

# ──────────────────────────────────────────────
# CSRF — trust the Render reverse proxy & frontend origin
# ──────────────────────────────────────────────
CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o.strip()
]

# ──────────────────────────────────────────────
# Security Hardening
# ──────────────────────────────────────────────
# Render terminates TLS at the load balancer and forwards via HTTP.
# This header tells Django the original request was HTTPS.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"
SECURE_HSTS_SECONDS = 31536000       # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
