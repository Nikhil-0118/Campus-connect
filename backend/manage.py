#!/usr/bin/env python
"""Django management script for CampusConnect."""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv


def main():
    # Load .env from the backend root directory
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Make sure it's installed and available "
            "on your PYTHONPATH, or activate your virtual environment."
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
