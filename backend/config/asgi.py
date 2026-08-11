"""
CampusConnect — ASGI Configuration
===================================
Exposes the ASGI callable as `application`.
Used for async support (WebSockets, HTTP/2, etc.).
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env before Django initialises
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

from django.core.asgi import get_asgi_application  # noqa: E402

application = get_asgi_application()
