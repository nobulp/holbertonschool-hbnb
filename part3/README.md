# HBnB - Part 3: Authentication, Authorization & Database Persistence

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Business Rules](#business-rules)
- [Testing](#testing)
- [Authors](#authors)

---

## Overview

Part 3 of the HBnB project extends the REST API built in Part 2 by introducing:

- **JWT-based authentication** using `flask-jwt-extended`
- **Role-based access control** (admin vs regular user)
- **SQLAlchemy ORM** replacing the in-memory repository
- **SQLite database** for persistent storage
- **Password hashing** using `flask-bcrypt`

All data is now persisted across server restarts in a local SQLite database.

---

## Architecture

The application follows a **3-layer architecture**:

```
┌──────────────────────────────────┐
│         Presentation Layer       │
│   Flask-RESTX Namespaces (API)   │
│  JWT Authentication Middleware   │
└────────────────┬─────────────────┘
                 │
┌────────────────▼─────────────────┐
│          Business Logic Layer    │
│         HBnBFacade (facade.py)   │
│    Models: User, Place, Review,  │
│            Amenity               │
└────────────────┬─────────────────┘
                 │
┌────────────────▼─────────────────┐
│         Persistence Layer        │
│   SQLAlchemyRepository + ORM     │
│   UserRepository (specialized)   │
│       SQLite (development.db)    │
└──────────────────────────────────┘
```

The **Facade pattern** centralizes all business logic and acts as the single entry point between the API layer and the persistence layer.

---

## Technologies

| Technology | Purpose |
|------------|---------|
| Python 3.x | Runtime |
| Flask | Web framework |
| Flask-RESTX | REST API + Swagger UI |
| Flask-SQLAlchemy | ORM integration |
| Flask-JWT-Extended | JWT authentication |
| Flask-Bcrypt | Password hashing |
| SQLite | Development database |

---

## Project Structure

```
part3/
├── app/
│   ├── __init__.py              # App factory, extensions init
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # Login + protected endpoint
│   │       ├── users.py         # User CRUD
│   │       ├── places.py        # Place CRUD
│   │       ├── reviews.py       # Review CRUD + DELETE
│   │       └── amenities.py     # Amenity CRUD
│   ├── models/
│   │   ├── base_model.py        # SQLAlchemy BaseModel (id, timestamps)
│   │   ├── user.py              # User model + bcrypt methods
│   │   ├── place.py             # Place model + FK owner_id
│   │   ├── review.py            # Review model + FK user_id, place_id
│   │   └── amenity.py           # Amenity model
│   ├── persistence/
│   │   └── repository.py        # SQLAlchemyRepository base class
│   └── services/
│       ├── facade.py            # HBnBFacade — all business logic
│       └── user_repository.py   # UserRepository (get_user_by_email)
├── tests/
│   ├── test_models.py           # Unit tests for models
│   └── test_endpoints.py        # Integration tests for endpoints
├── config.py                    # DevelopmentConfig (SQLite URI, SECRET_KEY)
├── run.py                       # Entry point
├── schema.sql                   # Raw SQL schema (table creation)
├── insert_data.sql              # Initial data (admin user + amenities)
└── requirements.txt
```

---

## Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/holbertonschool-hbnb.git
cd holbertonschool-hbnb/part3

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## Database Setup

### Option 1 — SQLAlchemy (recommended)

```bash
flask shell
```
```python
from app import db
db.create_all()
exit()
```

### Option 2 — Raw SQL scripts

```bash
sqlite3 instance/development.db < schema.sql
sqlite3 instance/development.db < insert_data.sql
```

### Create the first admin user

```bash
flask shell
```
```python
from app import db
from app.models.user import User

admin = User(
    first_name="Admin",
    last_name="HBnB",
    email="admin@hbnb.io",
    is_admin=True
)
admin.hash_password("admin1234")
db.session.add(admin)
db.session.commit()
exit()
```

---

## Running the Application

```bash
python run.py
```

The API is available at `http://127.0.0.1:5000`.  
The Swagger UI documentation is available at `http://127.0.0.1:5000/`.

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | No | Login and receive JWT token |
| GET | `/api/v1/auth/protected` | JWT | Test protected endpoint |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users/` | No | List all users |
| POST | `/api/v1/users/` | Admin JWT | Create a new user |
| GET | `/api/v1/users/<id>` | No | Get user by ID |
| PUT | `/api/v1/users/<id>` | JWT (self or admin) | Update user |

### Amenities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/amenities/` | No | List all amenities |
| POST | `/api/v1/amenities/` | Admin JWT | Create a new amenity |
| GET | `/api/v1/amenities/<id>` | No | Get amenity by ID |
| PUT | `/api/v1/amenities/<id>` | Admin JWT | Update amenity |

### Places

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/places/` | No | List all places |
| POST | `/api/v1/places/` | JWT | Create a new place |
| GET | `/api/v1/places/<id>` | No | Get place with owner, amenities, reviews |
| PUT | `/api/v1/places/<id>` | JWT (owner or admin) | Update place |
| GET | `/api/v1/places/<id>/reviews` | No | List all reviews for a place |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/reviews/` | No | List all reviews |
| POST | `/api/v1/reviews/` | JWT | Create a new review |
| GET | `/api/v1/reviews/<id>` | No | Get review by ID |
| PUT | `/api/v1/reviews/<id>` | JWT (author or admin) | Update review |
| DELETE | `/api/v1/reviews/<id>` | JWT (author or admin) | Delete review |

---

## Authentication

JWT tokens are issued on login and must be included in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Login example

```bash
curl -X POST http://127.0.0.1:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hbnb.io", "password": "admin1234"}'
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The token payload contains:
- `sub` — user ID
- `is_admin` — boolean flag for admin role (additional claim)

---

## Business Rules

### Users
- Email must be unique across the system
- Users can only update their own profile (admins can update anyone)
- Regular users cannot modify their `email` or `password` via PUT
- User creation requires admin privileges

### Places
- The `owner_id` is automatically set from the JWT — any value in the payload is ignored
- Only the owner or an admin can update a place

### Reviews
- A user cannot review a place they own
- A user can only leave one review per place
- Only the review author or an admin can update or delete a review
- Rating must be between 1 and 5

### Amenities
- Creating and updating amenities requires admin privileges

---

## Testing

```bash
cd part3
python -m pytest tests/ -v
```

The test suite covers:

| Category | Tests |
|----------|-------|
| Auth | Login success/failure, protected endpoint access |
| Users | CRUD, JWT enforcement, ownership checks, email uniqueness |
| Amenities | CRUD, name validation |
| Places | CRUD, JWT enforcement, ownership, coordinate validation |
| Reviews | CRUD, ownership, duplicate prevention, rating bounds |

---

## Authors

- **Serkan** — [GitHub](https://github.com/serkam31)
