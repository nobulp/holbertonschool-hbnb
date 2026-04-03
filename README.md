# HBnB Project

## Description
HBnB is a web application inspired by Airbnb, allowing users to manage places, reviews, and amenities.

## Project Structure

- `app/` → Core application code
- `app/api/` → API endpoints organized by version
- `app/api/v1/` → Version 1 of the API endpoints (users, places, reviews, amenities)
- `app/models/` → Business logic classes (User, Place, Review, Amenity)
- `app/services/` → Facade pattern implementation managing communication between layers
- `app/persistence/` → In-memory repository for object storage (will be replaced by database in Part 3)
- `run.py` → Entry point to run the Flask application
- `config.py` → Environment-specific configuration settings
- `requirements.txt` → List of required Python packages

## Installation
```bash
pip install -r requirements.txt
```

## Run the application
```bash
python run.py
```

## Access the API documentation

Visit: http://127.0.0.1:5000/api/v1/
## Quick Start

From the project root, you can launch both the API and the front-end with:

```bash
./start.sh
```

This will:
- start the Flask API from `part3`
- start the static front-end server from `part4`
- open `http://localhost:8000/index.html`

To stop the local servers later:

```bash
./stop.sh
```
