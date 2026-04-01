const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';
let allPlaces = [];

document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();
  setupIndexPage();
});

function setupLoginForm() {
  const loginForm = document.getElementById('login-form');

  if (!loginForm) {
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageElement = document.getElementById('login-message');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (!emailInput || !passwordInput || !messageElement || !submitButton) {
      return;
    }

    setMessage(messageElement, 'Signing in...', 'success');
    submitButton.disabled = true;

    try {
      const accessToken = await loginUser(emailInput.value.trim(), passwordInput.value);
      setCookie('token', accessToken, 1);
      setMessage(messageElement, 'Login successful. Redirecting...', 'success');
      window.location.href = 'index.html';
    } catch (error) {
      setMessage(messageElement, error.message, 'error');
      submitButton.disabled = false;
    }
  });
}

async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Login failed. Please check your credentials.');
  }

  if (!data.access_token) {
    throw new Error('Login succeeded but no token was returned by the API.');
  }

  return data.access_token;
}

function setCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();

    if (trimmedCookie.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmedCookie.substring(name.length + 1));
    }
  }

  return null;
}

function setMessage(element, message, type) {
  element.textContent = message;
  element.classList.remove('error', 'success');

  if (type) {
    element.classList.add(type);
  }
}

function setupIndexPage() {
  const placesList = document.getElementById('places-list');
  const priceFilter = document.getElementById('price-filter');

  if (!placesList || !priceFilter) {
    return;
  }

  checkAuthentication();

  priceFilter.addEventListener('change', () => {
    filterPlacesByPrice(priceFilter.value);
  });
}

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (loginLink) {
    loginLink.style.display = token ? 'none' : 'inline-flex';
  }

  fetchPlaces(token);
}

async function fetchPlaces(token) {
  const statusElement = document.getElementById('places-status');
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/places/`, { headers });
    const places = await response.json().catch(() => []);

    if (!response.ok) {
      throw new Error('Unable to load places from the API.');
    }

    allPlaces = Array.isArray(places) ? places : [];
    displayPlaces(allPlaces);
    applyCurrentFilter();
  } catch (error) {
    if (statusElement) {
      statusElement.textContent = error.message;
    }
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');

  if (!placesList) {
    return;
  }

  placesList.innerHTML = '';

  if (!places.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'places-status';
    emptyState.textContent = 'No places available.';
    placesList.appendChild(emptyState);
    return;
  }

  places.forEach((place) => {
    const placeCard = document.createElement('article');
    placeCard.className = 'place-card';
    placeCard.dataset.price = String(Number(place.price) || 0);

    const title = place.title || 'Untitled place';
    const description = place.description || 'No description available.';
    const price = Number(place.price) || 0;

    placeCard.innerHTML = `
      <h2>${escapeHtml(title)}</h2>
      <p class="price-tag">$${price} per night</p>
      <p>${escapeHtml(description)}</p>
      <a href="place.html" class="details-button">View Details</a>
    `;

    placesList.appendChild(placeCard);
  });
}

function filterPlacesByPrice(maxPrice) {
  const cards = document.querySelectorAll('.place-card');

  cards.forEach((card) => {
    const price = Number(card.dataset.price || 0);
    const shouldShow = maxPrice === 'all' || price <= Number(maxPrice);
    card.style.display = shouldShow ? 'flex' : 'none';
  });
}

function applyCurrentFilter() {
  const priceFilter = document.getElementById('price-filter');

  if (!priceFilter) {
    return;
  }

  filterPlacesByPrice(priceFilter.value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
