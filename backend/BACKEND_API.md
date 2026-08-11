# CampusConnect — Backend API Documentation

## Base URL

```
http://localhost:8000/api/
```

## Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## 1. Accounts

### POST /api/accounts/register/

Register a new user account.

**Auth Required:** No

**Request Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "StrongPass123!",
    "confirm_password": "StrongPass123!",
    "department": 1,
    "branch": 1,
    "year": 2,
    "student_id": "2024CS001"
}
```

**Response (201 Created):**
```json
{
    "message": "Registration successful",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "department": 1,
        "branch": 1,
        "year": 2,
        "student_id": "2024CS001"
    }
}
```

**Errors:**
- `400` — Validation error (duplicate username/email, password mismatch, etc.)

---

### POST /api/accounts/login/

Obtain JWT access and refresh tokens.

**Auth Required:** No

**Request Body:**
```json
{
    "username": "john_doe",
    "password": "StrongPass123!"
}
```

**Response (200 OK):**
```json
{
    "access": "eyJ0eXAiOiJKV1Qi...",
    "refresh": "eyJ0eXAiOiJKV1Qi..."
}
```

**Errors:**
- `401` — Invalid credentials

---

### POST /api/accounts/token/refresh/

Refresh an expired access token.

**Auth Required:** No

**Request Body:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1Qi..."
}
```

**Response (200 OK):**
```json
{
    "access": "eyJ0eXAiOiJKV1Qi...",
    "refresh": "eyJ0eXAiOiJKV1Qi..."
}
```

**Errors:**
- `401` — Invalid or expired refresh token

---

### GET /api/accounts/me/

Get the authenticated user's data.

**Auth Required:** Yes

**Response (200 OK):**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_picture": null,
    "bio": "",
    "department": 1,
    "department_detail": {"id": 1, "name": "Bachelor of Technology", "short_name": "B.Tech"},
    "branch": 1,
    "branch_detail": {"id": 1, "name": "Computer Science", "short_name": "CS"},
    "year": 2,
    "section": "A",
    "student_id": "2024CS001",
    "phone_number": "",
    "is_verified_student": false,
    "is_profile_completed": false,
    "date_joined": "2026-08-11T12:00:00Z"
}
```

---

## 2. Profiles

### GET /api/profiles/me/

Get the authenticated user's profile (auto-creates if not exists).

**Auth Required:** Yes

**Response (200 OK):**
```json
{
    "id": 1,
    "user": {
        "id": 1,
        "username": "john_doe",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "profile_picture": null,
        "bio": "",
        "department": 1,
        "department_detail": {"id": 1, "name": "Bachelor of Technology", "short_name": "B.Tech"},
        "branch": 1,
        "branch_detail": {"id": 1, "name": "Computer Science", "short_name": "CS"},
        "year": 2,
        "section": "A",
        "is_verified_student": false
    },
    "skills": ["Python", "Django"],
    "interests": ["Web Dev", "AI"],
    "social_links": {"github": "https://github.com/johndoe"},
    "created_at": "2026-08-11T12:00:00Z",
    "updated_at": "2026-08-11T12:00:00Z"
}
```

---

### PATCH /api/profiles/me/

Update the authenticated user's profile.

**Auth Required:** Yes

**Request Body (partial update):**
```json
{
    "skills": ["Python", "React", "ML"],
    "interests": ["Web Dev"],
    "bio": "CS student passionate about tech",
    "social_links": {"github": "https://github.com/johndoe"}
}
```

**Response (200 OK):** Updated profile object.

---

### GET /api/profiles/

List all student profiles (paginated).

**Auth Required:** Yes

**Query Parameters:**
- `user__department` — Filter by department ID
- `user__branch` — Filter by branch ID
- `user__year` — Filter by year
- `skills` — Filter by skills (comma-separated)
- `interests` — Filter by interests (comma-separated)
- `search` — Search in username, first_name, last_name
- `page` — Page number

**Example:** `GET /api/profiles/?user__branch=1&user__year=2`

---

### GET /api/profiles/{id}/

Get a specific student's profile.

**Auth Required:** Yes

---

## 3. Connections

### POST /api/connections/{user_id}/send/

Send a connection request.

**Auth Required:** Yes

**Response (201 Created):**
```json
{
    "id": 1,
    "sender": {"id": 1, "username": "john_doe", ...},
    "receiver": {"id": 2, "username": "jane_doe", ...},
    "status": "pending",
    "created_at": "2026-08-11T12:00:00Z"
}
```

**Errors:**
- `400` — Self-connection, duplicate connection
- `404` — User not found

---

### POST /api/connections/{user_id}/accept/

Accept a pending connection request.

**Auth Required:** Yes (only the receiver)

**Errors:**
- `404` — No pending request from this user

---

### POST /api/connections/{user_id}/reject/

Reject a pending connection request.

**Auth Required:** Yes (only the receiver)

---

### GET /api/connections/

List all accepted connections.

**Auth Required:** Yes

---

### GET /api/connections/requests/

List all pending connection requests received.

**Auth Required:** Yes

---

## 4. Teams

### POST /api/teams/create/

Create a new team.

**Auth Required:** Yes

**Request Body:**
```json
{
    "name": "AI Innovators",
    "description": "Building an AI-powered solution",
    "project_description": "Smart campus navigation using ML",
    "required_skills": ["Python", "TensorFlow", "React"],
    "max_members": 4,
    "hackathon_name": "HackFest 2026"
}
```

**Response (201 Created):** Team object with creator auto-added as member.

---

### GET /api/teams/

List all teams (paginated).

**Auth Required:** Yes

**Query Parameters:**
- `status` — Filter by status (open/closed/completed)
- `skills` — Filter by required skills
- `department` — Filter by creator's department
- `branch` — Filter by creator's branch
- `available` — Set to `true` for open, non-full teams
- `search` — Search in name, description, hackathon_name

---

### GET /api/teams/{id}/

Get team details.

**Auth Required:** Yes

---

### PATCH /api/teams/{id}/

Update team (creator only).

**Auth Required:** Yes (creator only)

---

### DELETE /api/teams/{id}/

Delete team (creator only).

**Auth Required:** Yes (creator only)

---

### POST /api/teams/{id}/join/

Join a team.

**Auth Required:** Yes

**Errors:**
- `400` — Team full, already a member, team closed
- `404` — Team not found

---

### POST /api/teams/{id}/leave/

Leave a team.

**Auth Required:** Yes

**Errors:**
- `400` — Not a member, creator cannot leave

---

### GET /api/teams/my/

List teams the user is a member of.

**Auth Required:** Yes

---

## 5. Marketplace

### POST /api/marketplace/listings/create/

Create a new listing.

**Auth Required:** Yes

**Request Body:**
```json
{
    "title": "Engineering Mathematics Textbook",
    "description": "3rd edition, barely used",
    "category": "books",
    "price": "350.00",
    "condition": "like_new",
    "location": "Hostel Block A"
}
```

**Categories:** `books`, `notes`, `electronics`, `calculators`, `lab_equipment`, `college_materials`, `other`

**Conditions:** `new`, `like_new`, `good`, `fair`, `poor`

---

### GET /api/marketplace/listings/

Browse all listings (paginated).

**Auth Required:** Yes

**Query Parameters:**
- `category` — Filter by category
- `condition` — Filter by condition
- `status` — Filter by status
- `price__gte` — Minimum price
- `price__lte` — Maximum price
- `search` — Search in title, description
- `ordering` — Order by `price` or `created_at` (prefix with `-` for descending)

**Example:** `GET /api/marketplace/listings/?category=books&price__lte=500&search=calculus`

---

### GET /api/marketplace/listings/{id}/

Get listing details.

**Auth Required:** Yes

---

### PATCH /api/marketplace/listings/{id}/

Update listing (seller only).

**Auth Required:** Yes (seller only)

---

### DELETE /api/marketplace/listings/{id}/

Delete listing (seller only).

**Auth Required:** Yes (seller only)

---

### POST /api/marketplace/listings/{id}/mark-sold/

Mark listing as sold (seller only).

**Auth Required:** Yes (seller only)

---

### GET /api/marketplace/my-listings/

List the user's own listings.

**Auth Required:** Yes

---

### POST /api/marketplace/listings/{id}/interest/

Express interest in a listing.

**Auth Required:** Yes

**Request Body:**
```json
{
    "message": "Hi! Is this still available? Can we meet at the canteen?"
}
```

**Errors:**
- `400` — Own listing, listing not available, duplicate interest

---

### GET /api/marketplace/my-interests/

List interests the user has expressed.

**Auth Required:** Yes

---

### GET /api/marketplace/listings/{id}/interests/

List interests on a listing (seller only sees their own listing's interests).

**Auth Required:** Yes (seller only)

---

## 6. Lost & Found

### POST /api/lost-found/create/

Report a lost or found item.

**Auth Required:** Yes

**Request Body:**
```json
{
    "item_type": "lost",
    "title": "Blue Backpack",
    "description": "Lost near the main library, has a laptop inside",
    "category": "accessories",
    "location": "Main Library, 2nd Floor",
    "date": "2026-08-10"
}
```

**Types:** `lost`, `found`

**Categories:** `electronics`, `documents`, `accessories`, `clothing`, `books`, `keys`, `wallet`, `other`

---

### GET /api/lost-found/

Browse all lost/found items (paginated).

**Auth Required:** Yes

**Query Parameters:**
- `item_type` — `lost` or `found`
- `category` — Filter by category
- `status` — Filter by status (`active`, `claimed`, `resolved`)
- `date` — Exact date
- `date__gte`, `date__lte` — Date range
- `search` — Search in title, description, location

---

### GET /api/lost-found/{id}/

Get item details.

**Auth Required:** Yes

---

### PATCH /api/lost-found/{id}/

Update item (owner only).

**Auth Required:** Yes (owner only)

---

### DELETE /api/lost-found/{id}/

Delete item (owner only).

**Auth Required:** Yes (owner only)

---

### POST /api/lost-found/{id}/resolve/

Mark item as resolved (owner only).

**Auth Required:** Yes (owner only)

---

### GET /api/lost-found/my/

List the user's own lost/found items.

**Auth Required:** Yes

---

### GET /api/lost-found/{id}/matches/

Find potential matches for a lost/found item. Returns opposite-type items with match scores.

**Auth Required:** Yes

**Response (200 OK):**
```json
[
    {
        "item": {
            "id": 5,
            "item_type": "found",
            "title": "Blue Bag Found",
            "category": "accessories",
            "location": "Library"
        },
        "score": 72
    }
]
```

---

## 7. Events

### POST /api/events/create/

Create a new event.

**Auth Required:** Yes

**Request Body:**
```json
{
    "title": "Annual Hackathon 2026",
    "description": "24-hour coding marathon",
    "venue": "College Auditorium",
    "date": "2026-09-15",
    "start_time": "09:00:00",
    "end_time": "18:00:00",
    "category": "hackathon",
    "registration_link": "https://example.com/register"
}
```

**Categories:** `hackathon`, `workshop`, `seminar`, `cultural`, `sports`, `tech`, `club`, `other`

---

### GET /api/events/

Browse all events (paginated).

**Auth Required:** Yes

**Query Parameters:**
- `category` — Filter by category
- `date` — Exact date
- `date__gte`, `date__lte` — Date range
- `organizer` — Filter by organizer ID
- `upcoming` — Set to `true` for future events only
- `search` — Search in title, description, venue
- `ordering` — Order by `date` or `created_at`

---

### GET /api/events/{id}/

Get event details.

**Auth Required:** Yes

---

### PATCH /api/events/{id}/

Update event (organizer only).

**Auth Required:** Yes (organizer only)

---

### DELETE /api/events/{id}/

Delete event (organizer only).

**Auth Required:** Yes (organizer only)

---

### POST /api/events/{id}/register/

Register for an event.

**Auth Required:** Yes

**Errors:**
- `400` — Already registered
- `404` — Event not found

---

### GET /api/events/my-registrations/

List events the user has registered for.

**Auth Required:** Yes

---

## 8. Notifications

### GET /api/notifications/

List all notifications for the authenticated user (paginated).

**Auth Required:** Yes

**Response (200 OK):**
```json
{
    "count": 3,
    "results": [
        {
            "id": 1,
            "recipient": 1,
            "sender": 2,
            "sender_username": "jane_doe",
            "notification_type": "connection_request",
            "message": "jane_doe sent you a connection request.",
            "is_read": false,
            "created_at": "2026-08-11T12:00:00Z"
        }
    ]
}
```

**Notification Types:** `connection_request`, `connection_accepted`, `team_join`, `marketplace_interest`, `lost_found_match`, `event_registration`, `general`

---

### POST /api/notifications/{id}/read/

Mark a notification as read.

**Auth Required:** Yes

---

### POST /api/notifications/read-all/

Mark all notifications as read.

**Auth Required:** Yes

---

## 9. Search

### GET /api/search/?q={query}

Unified search across all models.

**Auth Required:** Yes

**Query Parameters:**
- `q` — Search query (required)
- `type` — Limit to specific category: `profiles`, `teams`, `listings`, `lost_found`, `events`

**Example:** `GET /api/search/?q=python&type=teams`

**Response (200 OK):**
```json
{
    "profiles": [...],
    "teams": [...],
    "listings": [...],
    "lost_found": [...],
    "events": [...]
}
```

---

## Pagination

All list endpoints use page-based pagination:

```json
{
    "count": 50,
    "next": "http://localhost:8000/api/teams/?page=2",
    "previous": null,
    "results": [...]
}
```

Default page size: 20 items per page.

---

## Error Responses

All error responses follow this format:

```json
{
    "error": "Description of what went wrong."
}
```

Or for validation errors:

```json
{
    "field_name": ["Error message."]
}
```

**Common HTTP Status Codes:**
- `200` — Success
- `201` — Created
- `400` — Bad Request (validation error)
- `401` — Unauthorized (missing/invalid JWT)
- `403` — Forbidden (not the owner/creator)
- `404` — Not Found
