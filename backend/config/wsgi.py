"""
CampusConnect — WSGI Configuration
===================================
Exposes the WSGI callable as `application`.
Used by production servers like Gunicorn.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env before Django initialises
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

from django.core.wsgi import get_wsgi_application  # noqa: E402

application = get_wsgi_application()
