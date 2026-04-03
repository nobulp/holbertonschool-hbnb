# HBnB - Part 4: Simple Web Client

## Overview

`part4` contains the front-end client for the HBnB project.
It is built with:

- HTML5
- CSS3
- vanilla JavaScript

This client connects to the API from `part3` and provides the main user flow for:

- logging in
- browsing places
- viewing place details
- submitting a review

## Goals

The purpose of this part is to build a small but functional web client that:

- respects the project structure requested in the tasks
- communicates with the back-end API using `fetch`
- stores the JWT token in a cookie
- updates the UI dynamically without a page reload
- provides a more polished user experience than a purely static mockup

## Stack

### Front-end

- HTML5
- CSS3
- JavaScript ES6

### Back-end dependency

- Python
- Flask
- REST API
- JWT authentication

## Pages

### `index.html`

Main page of the client.

Features:

- displays the list of places from the API
- filters places by price
- shows or hides authentication actions depending on session state
- links to each place detail page

### `login.html`

Authentication page.

Features:

- login form
- API call to authenticate the user
- JWT cookie storage
- error and success feedback

### `place.html`

Detailed page for one place.

Features:

- loads a specific place using its ID from the URL
- displays host, price, description, amenities, and reviews
- shows the add review action when the user is authenticated

### `add_review.html`

Review submission page.

Features:

- restricted to authenticated users
- loads the current place from the URL
- sends a review and rating to the API
- gives feedback on submission state

## Main Files

- `index.html`
- `login.html`
- `place.html`
- `add_review.html`
- `styles.css`
- `scripts.js`
- `logo.png`
- `icon.png`

Additional visual assets currently used by the interface:

- `place-lake.svg`
- `place-forest.svg`
- `place-city.svg`
- `hero-backdrop.svg`
- `hero-escape.svg`

## Implemented Features

### 1. Design

- shared layout across all pages
- semantic sections with `header`, `main`, and `footer`
- responsive layout for desktop and mobile
- premium visual direction with light and dark themes
- animated hero and subtle motion effects
- cookie notice and privacy modal

### 2. Login

- login request sent to the API with `fetch`
- JWT stored in a cookie named `token`
- redirect to the home page after success
- invalid credentials handled with a visible message

### 3. View Places

- places loaded dynamically from the API
- cards rendered on the client side
- client-side filtering by price
- login/logout actions updated from cookie state

### 4. Place Details

- place ID read from the URL
- place details fetched from the API
- amenities and reviews rendered dynamically
- add review action available only when authenticated

### 5. Add Review

- authentication required
- place ID read from the URL
- review text and rating submitted to the API
- success and error feedback displayed in the form

## Current User Flow

1. Open `index.html`
2. Browse places
3. Open `login.html` if authentication is needed
4. Log in
5. Return to the home page
6. Open `place.html?id=<place_id>`
7. Submit a review from `add_review.html?id=<place_id>`

## Project Structure

```text
part4/
├── README.md
├── index.html
├── login.html
├── place.html
├── add_review.html
├── styles.css
├── scripts.js
├── logo.png
├── icon.png
├── place-lake.svg
├── place-forest.svg
├── place-city.svg
├── hero-backdrop.svg
└── hero-escape.svg
```

## Requirements

To use this client locally, you need:

- Python 3
- the API in `part3`
- a Python virtual environment for `part3`

## Running the Project

### Option 1. Recommended: launch from the project root

From the repository root:

```bash
cd /Users/nobu/hbnb-front/holbertonschool-hbnb
./start.sh
```

This script:

- starts the Flask API from `part3`
- starts the static server for `part4`
- opens `http://localhost:8000/index.html`

To stop the local servers:

```bash
./stop.sh
```

### Option 2. Manual launch

#### Start the API

```bash
cd /Users/nobu/hbnb-front/holbertonschool-hbnb/part3
source venv/bin/activate
python3 run.py
```

API URL:

```text
http://127.0.0.1:5000
```

#### Start the front-end

```bash
cd /Users/nobu/hbnb-front/holbertonschool-hbnb/part4
python3 -m http.server 8000
```

Front-end URL:

```text
http://localhost:8000/index.html
```

## API Endpoints Used

The client currently depends on these API routes:

- `POST /api/v1/auth/login`
- `GET /api/v1/places/`
- `GET /api/v1/places/<id>`
- `POST /api/v1/reviews/`

Base URL used in the client:

```text
http://127.0.0.1:5000/api/v1
```

## Authentication

After a successful login:

- the API returns a JWT token
- the token is stored in a cookie named `token`
- the navigation updates automatically
- authenticated pages can use the token in the `Authorization` header

## Accessibility and UX Notes

The client includes:

- skip links
- visible keyboard focus states
- live regions for dynamic status messages
- inline error feedback for forms
- responsive adjustments for mobile
- reduced-motion support for users who prefer less animation

## Testing Checklist

### Login

- open `login.html`
- test valid credentials
- test invalid credentials
- verify that the `token` cookie is created after success

### Home / Places

- open `index.html`
- confirm that places are loaded from the API
- test the price filter
- test navigation to place details

### Place Details

- open a place from the home page
- verify host, price, description, amenities, and reviews
- verify that the add review button appears only when logged in

### Add Review

- log in first
- open a place
- click `Add Review`
- test empty form validation
- submit a valid review

## Known Limits

This front-end currently does not include:

- user registration
- place creation
- place editing or deletion
- review editing or deletion
- booking/reservation flow
- search backed by real API search logic

It mainly covers:

- authentication
- place browsing
- place details
- review submission

## Notes

- the front-end depends on `part3`; without the API, the dynamic pages will not work
- CORS must be enabled in `part3` for requests from `http://localhost:8000`
- some visual assets are local placeholders and can be replaced with your own images later
