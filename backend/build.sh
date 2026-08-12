#!/usr/bin/env bash
# Exit on error
set -o errexit

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Collect static files for WhiteNoise
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate

# Initialize production superuser & default department/branch data
python manage.py initialize_production
