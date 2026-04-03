# HBnB - Part 4: Simple Web Client

## Overview

This directory contains the front-end client for the HBnB project.
It is built with HTML5, CSS3, and vanilla JavaScript.

The goal of this part is to provide a simple web interface connected to the API developed in `part3`.

## Pages

- `index.html`: main page that displays the list of places
- `login.html`: login form
- `place.html`: place details page
- `add_review.html`: add review form

## Files

- `styles.css`: global styles for the client
- `scripts.js`: client-side JavaScript logic
- `logo.png`: application logo
- `icon.png`: favicon

## Implemented Features

### Task 1 - Design

- Common layout with `header`, `main`, and `footer`
- Navigation links between pages
- Logo with class `logo`
- Login link with class `login-button`
- Styled cards, forms, buttons, and layout

### Task 2 - Login

- Login form submission handled with JavaScript
- Request sent to the API with `fetch`
- JWT token stored in a cookie after successful login
- Error message displayed on login failure
- Redirect to `index.html` after successful login

### Task 3 - Index

- Places fetched dynamically from the API
- Cards rendered with JavaScript
- Login link shown or hidden depending on authentication status
- Client-side filtering implemented from the dropdown

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
└── icon.png
```

## Requirements

- Python 3
- The API from `part3`
- A virtual environment for `part3`

## How to Run

### 1. Start the API

From `part3`:

```bash
cd /Users/nobu/hbnb-front/holbertonschool-hbnb/part3
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
python3 run.py
```

The API runs on:

```text
http://127.0.0.1:5000
```

### 2. Start the front-end client

From `part4`:

```bash
cd /Users/nobu/hbnb-front/holbertonschool-hbnb/part4
python3 -m http.server 8000
```

Open in the browser:

```text
http://localhost:8000/index.html
```

## Authentication Flow

1. The user fills in the login form in `login.html`
2. JavaScript sends a `POST` request to:

```text
http://127.0.0.1:5000/api/v1/auth/login
```

3. If login succeeds, the API returns a JWT token
4. The token is stored in a cookie named `token`
5. The user is redirected to `index.html`

## Places Flow

1. `index.html` loads
2. JavaScript checks whether the `token` cookie exists
3. JavaScript fetches places from:

```text
http://127.0.0.1:5000/api/v1/places/
```

4. The places are rendered dynamically in the page
5. The dropdown can filter visible places on the client side

## Testing

### Test login

- Open `http://localhost:8000/login.html`
- Enter valid credentials
- Verify that:
  - the login succeeds
  - a cookie named `token` is created
  - the user is redirected to `index.html`

### Test invalid login

- Enter wrong credentials
- Verify that an error message is displayed

### Test places page

- Open `http://localhost:8000/index.html`
- Verify that places are loaded from the API
- Change the filter dropdown and verify that cards are shown or hidden

## Notes

- The front-end depends on the API from `part3`
- If the API is not running, the client cannot log in or fetch places
- CORS must be enabled in the API for the browser to allow requests from `http://localhost:8000`
