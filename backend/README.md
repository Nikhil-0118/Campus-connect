# CampusConnect — Backend

Production-ready Django REST API foundation for the CampusConnect student platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Django 5.2 LTS |
| API | Django REST Framework |
| Auth | Simple JWT (installed, endpoints not yet wired) |
| Database | PostgreSQL (production) / SQLite (development) |
| CORS | django-cors-headers |
| Env Vars | python-dotenv |

---

## Folder Structure

```
backend/
├── config/                  # Project configuration
│   ├── settings/
│   │   ├── base.py          # Shared settings
│   │   ├── development.py   # SQLite, DEBUG=True
│   │   └── production.py    # PostgreSQL, DEBUG=False
│   ├── urls.py              # Root URL config
│   ├── wsgi.py              # WSGI entry point
│   └── asgi.py              # ASGI entry point
├── apps/                    # Django applications
├── common/                  # Shared utilities & base classes
├── manage.py
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Quick Start

### 1. Clone & navigate

```bash
cd backend
```

### 2. Create a virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
# Copy the example and edit as needed
cp .env.example .env
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Start the development server

```bash
python manage.py runserver
```

The server will be available at **http://127.0.0.1:8000/**

---

## Switching Environments

Set `DJANGO_SETTINGS_MODULE` in your `.env` file:

| Environment | Value |
|---|---|
| Development | `config.settings.development` |
| Production | `config.settings.production` |

---

## Creating a New App

```bash
# Create the app inside the apps/ directory
python manage.py startapp <app_name> apps/<app_name>
```

Then register it in `config/settings/base.py`:

```python
LOCAL_APPS = [
    "apps.<app_name>",
]
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `Django` | Web framework |
| `djangorestframework` | REST API toolkit |
| `djangorestframework-simplejwt` | JWT authentication |
| `django-cors-headers` | Cross-Origin Resource Sharing |
| `psycopg[binary]` | PostgreSQL adapter (psycopg 3) |
| `python-dotenv` | Load `.env` into environment |
| `gunicorn` | Production WSGI server |
