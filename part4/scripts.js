const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';
let allPlaces = [];
const PLACE_LOCATION_STORAGE_KEY = 'place_location_labels';

// Drop your own photos in part4/images/ using these filenames.
// If a custom file is missing, the UI falls back to the local SVG artwork.
const PLACE_IMAGE_PRESETS = [
  {
    preferred: 'images/lake-house.jpg',
    fallback: 'place-lake.svg',
    keywords: ['lake', 'water', 'coast', 'beach', 'retreat', 'khxwb']
  },
  {
    preferred: 'images/forest-cabin.jpg',
    fallback: 'place-forest.svg',
    keywords: ['forest', 'cabin', 'wood', 'mountain', 'nature']
  },
  {
    preferred: 'images/city-stay.jpg',
    fallback: 'place-city.svg',
    keywords: ['city', 'urban', 'downtown', 'studio', 'apartment', 'appart', 'apt', 'flat']
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  setupHeaderShrink();
  renderSiteNotice();
  setFooterYear();
  setupNav();
  setupCookieBanner();
  setupScrollReveal();
  setupLoginForm();
  setupIndexPage();
  setupMyPlacesPage();
  setupPlacePage();
  setupAddReviewPage();
  setupAddPlacePage();
});

/* =====================================================================
   Navigation & authentication state
   ===================================================================== */

/**
 * Show/hide the login link and logout button based on session token.
 * Runs on every page.
 */
function setupNav() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  const logoutButton = document.getElementById('logout-button');
  const addPlaceLink = document.getElementById('add-place-link');
  const myPlacesLink = document.getElementById('my-places-link');

  if (loginLink) {
    loginLink.hidden = !!token;
  }

  if (addPlaceLink) {
    addPlaceLink.hidden = !token;
    addPlaceLink.setAttribute('aria-hidden', String(!token));
  }

  if (myPlacesLink) {
    myPlacesLink.hidden = !token;
    myPlacesLink.setAttribute('aria-hidden', String(!token));
  }

  if (logoutButton) {
    logoutButton.hidden = !token;
    logoutButton.setAttribute('aria-hidden', String(!token));
    logoutButton.addEventListener('click', logout);
  }
}

function logout() {
  // Expire the token cookie immediately
  document.cookie = 'token=; max-age=0; path=/; SameSite=Lax';
  window.location.href = 'index.html';
}

function setupHeaderShrink() {
  const pageHeader = document.querySelector('header');

  if (!pageHeader) {
    return;
  }

  let isCondensed = false;
  const collapseAt = 44;
  const expandAt = 16;

  const updateHeaderState = () => {
    const scrollY = window.scrollY;

    if (!isCondensed && scrollY > collapseAt) {
      isCondensed = true;
      document.body.classList.add('header-condensed');
    } else if (isCondensed && scrollY < expandAt) {
      isCondensed = false;
      document.body.classList.remove('header-condensed');
    }
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(theme);

  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) {
    return;
  }

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    themeToggle.classList.remove('theme-toggle--animate');
    document.body.classList.remove('theme-transition');
    void themeToggle.offsetWidth;
    themeToggle.classList.add('theme-toggle--animate');
    document.body.classList.add('theme-transition');
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    window.setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 900);
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;

  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) {
    return;
  }

  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to night mode');

  const icon = themeToggle.querySelector('.theme-toggle-icon');
  if (icon) {
    icon.textContent = isDark ? '☀' : '☾';
  }
}

function setSiteNotice(message) {
  sessionStorage.setItem('site_notice', message);
}

function renderSiteNotice() {
  const message = sessionStorage.getItem('site_notice');
  const main = document.getElementById('main-content');

  if (!message || !main) {
    return;
  }

  const notice = document.createElement('div');
  notice.className = 'site-notice';
  notice.setAttribute('role', 'status');
  notice.textContent = message;
  main.prepend(notice);
  sessionStorage.removeItem('site_notice');
}

function redirectToIndexWithNotice(message) {
  setSiteNotice(message);
  window.location.href = 'index.html';
}

/* =====================================================================
   GDPR / cookie consent banner
   ===================================================================== */

function setupCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  // Show banner if the user has not yet acknowledged the notice
  if (!localStorage.getItem('gdpr_notice_seen')) {
    banner.classList.remove('hidden');
  }

  const acceptBtn = document.getElementById('cookie-accept');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('gdpr_notice_seen', '1');
      banner.classList.add('hidden');
    });
  }

  const moreBtn = document.getElementById('cookie-more');
  if (moreBtn) {
    moreBtn.addEventListener('click', showPrivacyModal);
  }

  const footerBtn = document.getElementById('privacy-footer-btn');
  if (footerBtn) {
    footerBtn.addEventListener('click', showPrivacyModal);
  }
}

function showPrivacyModal() {
  const modal = document.getElementById('privacy-modal');
  if (!modal) return;

  modal.showModal();

  const closeBtn = document.getElementById('privacy-modal-close');
  if (closeBtn) {
    // Replace to avoid duplicate listeners across calls
    const newClose = closeBtn.cloneNode(true);
    closeBtn.replaceWith(newClose);
    newClose.addEventListener('click', () => modal.close());
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  }, { once: true });
}

/* =====================================================================
   Footer year
   ===================================================================== */

function setFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* =====================================================================
   Login page
   ===================================================================== */

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

    clearFieldValidity(emailInput, passwordInput);

    if (!emailInput.value.trim()) {
      setFieldValidity(emailInput, true);
      setMessage(messageElement, 'Enter your email address to continue.', 'error');
      emailInput.focus();
      return;
    }

    if (!passwordInput.value) {
      setFieldValidity(passwordInput, true);
      setMessage(messageElement, 'Enter your password to continue.', 'error');
      passwordInput.focus();
      return;
    }

    setMessage(messageElement, 'Signing in…', 'success');
    submitButton.disabled = true;
    loginForm.setAttribute('aria-busy', 'true');

    try {
      const accessToken = await loginUser(emailInput.value.trim(), passwordInput.value);
      setCookie('token', accessToken, 1);
      setMessage(messageElement, 'Login successful. Redirecting…', 'success');
      window.location.href = 'index.html';
    } catch (error) {
      setFieldValidity(emailInput, true);
      setFieldValidity(passwordInput, true);
      setMessage(messageElement, error.message, 'error');
      submitButton.disabled = false;
      passwordInput.focus();
    } finally {
      loginForm.removeAttribute('aria-busy');
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
    throw new Error(getLoginErrorMessage(response.status, data));
  }

  if (!data.access_token) {
    throw new Error('Login succeeded but no token was returned by the API.');
  }

  return data.access_token;
}

function getLoginErrorMessage(status, data) {
  const apiError = typeof data?.error === 'string' ? data.error : '';

  if (status === 401 || apiError.toLowerCase() === 'invalid credentials') {
    return 'The email or password is incorrect. Please try again.';
  }

  if (status >= 500) {
    return 'The server is temporarily unavailable. Please try again in a moment.';
  }

  return apiError || 'Login failed. Please check your information and try again.';
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

  const isError = type === 'error';
  element.setAttribute('role', isError ? 'alert' : 'status');
  element.setAttribute('aria-live', isError ? 'assertive' : 'polite');
  element.setAttribute('aria-atomic', 'true');
}

function setFieldValidity(field, isInvalid) {
  if (!field) {
    return;
  }

  field.setAttribute('aria-invalid', String(Boolean(isInvalid)));
}

function clearFieldValidity(...fields) {
  fields.forEach((field) => setFieldValidity(field, false));
}

/* =====================================================================
   Index page — list of places
   ===================================================================== */

function setupIndexPage() {
  const placesList = document.getElementById('places-list');
  const priceFilter = document.getElementById('price-filter');

  if (!placesList || !priceFilter) {
    return;
  }

  const token = getCookie('token');
  fetchPlaces(token);

  priceFilter.addEventListener('change', () => {
    filterPlacesByPrice(priceFilter.value);
  });
}

function setupMyPlacesPage() {
  const placesList = document.getElementById('my-places-list');
  const statusElement = document.getElementById('my-places-status');

  if (!placesList || !statusElement) {
    return;
  }

  const token = getAuthToken();

  if (!token) {
    redirectToIndexWithNotice('Please log in to view your places.');
    return;
  }

  loadMyPlaces(token, placesList, statusElement);
}

async function loadMyPlaces(token, placesList, statusElement) {
  const currentUserId = getJwtIdentityFromToken(token);
  const headers = { Authorization: `Bearer ${token}` };
  const listingPanel = placesList.closest('.listing-panel--minimal');

  try {
    const response = await fetch(`${API_BASE_URL}/places/`, { headers });
    const places = await response.json().catch(() => []);

    if (!response.ok || !Array.isArray(places)) {
      throw new Error('Unable to load your places.');
    }

    const details = await Promise.all(
      places.map(async (place) => {
        if (!place?.id) {
          return null;
        }

        try {
          const detailResponse = await fetch(`${API_BASE_URL}/places/${encodeURIComponent(place.id)}`, { headers });
          const detail = await detailResponse.json().catch(() => null);
          return detailResponse.ok ? detail : null;
        } catch {
          return null;
        }
      })
    );

    const ownedPlaces = details.filter((place) => place && (place.owner?.id === currentUserId));

    statusElement.remove();
    placesList.innerHTML = '';

    if (!ownedPlaces.length) {
      const emptyState = document.createElement('p');
      emptyState.className = 'places-status places-status--empty';
      emptyState.textContent = 'You have not published any places yet. Create one and it will appear here.';
      placesList.appendChild(emptyState);
      if (listingPanel) {
        listingPanel.classList.add('is-visible', 'listing-panel--empty');
      }
      return;
    }

    if (listingPanel) {
      listingPanel.classList.remove('listing-panel--empty');
      listingPanel.classList.add('is-visible');
    }

    ownedPlaces.forEach((place, index) => {
      const card = createPlaceCard(place, index, {
        primaryLabel: 'Open Place',
        primaryHref: `place.html?id=${encodeURIComponent(place.id)}`,
        secondaryLabel: 'Edit Place',
        secondaryHref: `add_place.html?id=${encodeURIComponent(place.id)}&mode=edit`
      });
      card.classList.add('is-visible');

      const actionsContainer = card.querySelector('.place-card-actions');
      if (actionsContainer && place.id) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'details-button details-button--danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('aria-label', `Delete ${place.title || 'this place'}`);
        actionsContainer.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', async () => {
          if (!window.confirm('Delete this place? This cannot be undone.')) {
            return;
          }
          deleteBtn.disabled = true;
          try {
            await deletePlace(token, place.id);
            card.remove();
            if (!placesList.querySelector('.place-card')) {
              const emptyState = document.createElement('p');
              emptyState.className = 'places-status places-status--empty';
              emptyState.textContent = 'You have not published any places yet. Create one and it will appear here.';
              placesList.appendChild(emptyState);
              if (listingPanel) {
                listingPanel.classList.add('listing-panel--empty');
              }
            }
          } catch (error) {
            // eslint-disable-next-line no-alert
            alert(error.message || 'Failed to delete place.');
            deleteBtn.disabled = false;
          }
        });
      }

      placesList.appendChild(card);
    });

    setupScrollReveal();
  } catch (error) {
    if (listingPanel) {
      listingPanel.classList.add('is-visible', 'listing-panel--empty');
    }
    setPlacesStatus('my-places-status', error.message, 'error');
  }
}

function getStoredPlaceLocations() {
  try {
    const raw = localStorage.getItem(PLACE_LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredPlaceLocations(locations) {
  localStorage.setItem(PLACE_LOCATION_STORAGE_KEY, JSON.stringify(locations));
}

function setStoredPlaceLocation(placeId, label) {
  if (!placeId || !label) {
    return;
  }

  const locations = getStoredPlaceLocations();
  locations[placeId] = label.trim();
  saveStoredPlaceLocations(locations);
}

function getPlaceLocationLabel(place) {
  const storedLabel = place?.id ? getStoredPlaceLocations()[place.id] : '';

  if (storedLabel) {
    return storedLabel;
  }

  return getPlaceAreaLabel(place?.latitude, place?.longitude);
}

async function fetchPlaces(token) {
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
    displayPlaces(allPlaces, token);
    applyCurrentFilter();
  } catch (error) {
    setPlacesStatus('places-status', error.message, 'error');
  }
}

function displayPlaces(places, token = getCookie('token')) {
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

  places.forEach((place, index) => {
    const placeCard = createPlaceCard(place, index);
    const detailsLink = placeCard.querySelector('.details-button');
    const mediaImage = placeCard.querySelector('.place-media img');

    if (mediaImage) {
      mediaImage.addEventListener('error', () => {
        const fallback = mediaImage.dataset.fallback;

        if (fallback && mediaImage.getAttribute('src') !== fallback) {
          mediaImage.src = fallback;
        }
      }, { once: true });
    }

    if (detailsLink) {
      detailsLink.addEventListener('click', () => {
        rememberPlace(place);
      });
    }

    placesList.appendChild(placeCard);
  });

  setupScrollReveal();
  enrichPlaceCardsWithRatings(places, token);
}

function createPlaceCard(place, index = 0, actions = {}) {
  const placeCard = document.createElement('article');
  placeCard.className = 'place-card';
  placeCard.dataset.price = String(Number(place.price) || 0);
  placeCard.dataset.reveal = 'card';

  const title = place.title || 'New stay';
  const price = Number(place.price) || 0;
  const placeId = place.id || '';
  const area = getPlaceLocationLabel(place);
  const imageChoice = getPlaceImage(place, index);
  const initialAverageRating = getAverageRating(Array.isArray(place.reviews) ? place.reviews : []);
  const primaryLabel = actions.primaryLabel || 'View Details';
  const primaryHref = actions.primaryHref || `place.html?id=${encodeURIComponent(placeId)}`;
  const secondaryAction = actions.secondaryLabel && actions.secondaryHref
    ? `<a href="${escapeHtml(actions.secondaryHref)}" class="details-button details-button--secondary">${escapeHtml(actions.secondaryLabel)}</a>`
    : '';

  placeCard.innerHTML = `
    <div class="place-media">
      <img
        src="${escapeHtml(imageChoice.preferred)}"
        alt="${escapeHtml(title)}"
        loading="lazy"
        data-fallback="${escapeHtml(imageChoice.fallback)}"
      >
    </div>
    <div class="place-card-body">
      <div class="place-card-headline">
        <div class="place-card-title-block">
          <h2>${escapeHtml(title)}</h2>
          <p class="place-location">${escapeHtml(area)}</p>
        </div>
        <p class="price-tag"><strong>$${price}</strong><span>/ night</span></p>
      </div>
      <div class="place-card-rating" data-place-rating>
        ${renderCardRating(initialAverageRating)}
      </div>
      <div class="place-card-actions">
        <a href="${escapeHtml(primaryHref)}" class="details-button" aria-label="${escapeHtml(primaryLabel)} for ${escapeHtml(title)}">${escapeHtml(primaryLabel)}</a>
        ${secondaryAction}
      </div>
    </div>
  `;

  return placeCard;
}

async function enrichPlaceCardsWithRatings(places, token) {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requests = places.map(async (place) => {
    if (!place?.id) {
      return;
    }

    const card = document.querySelector(`.place-card a[href="place.html?id=${encodeURIComponent(place.id)}"]`)?.closest('.place-card');
    const ratingContainer = card?.querySelector('[data-place-rating]');

    if (!card || !ratingContainer) {
      return;
    }

    if (Array.isArray(place.reviews) && place.reviews.length) {
      ratingContainer.innerHTML = renderCardRating(getAverageRating(place.reviews));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/places/${encodeURIComponent(place.id)}`, { headers });
      const detail = await response.json().catch(() => null);

      if (!response.ok || !detail) {
        return;
      }

      const averageRating = getAverageRating(Array.isArray(detail.reviews) ? detail.reviews : []);
      ratingContainer.innerHTML = renderCardRating(averageRating);
    } catch (error) {
      // Keep the card clean if rating enrichment fails.
    }
  });

  await Promise.all(requests);
}

function renderCardRating(averageRating) {
  if (!averageRating) {
    return `
      <div class="place-card-rating-summary place-card-rating-summary--empty" aria-label="No ratings yet">
        ${emptyStarsHtml()}
        <span>New</span>
      </div>
    `;
  }

  return `
    <div class="place-card-rating-summary" aria-label="Average rating ${averageRating.toFixed(1)} out of 5">
      ${starsHtml(averageRating)}
      <span>${averageRating.toFixed(1)}</span>
    </div>
  `;
}

function emptyStarsHtml() {
  const stars = Array.from({ length: 5 }, () =>
    '<span class="star" aria-hidden="true">★</span>'
  ).join('');
  return `<div class="stars" role="img" aria-label="No ratings yet">${stars}</div>`;
}

function getPlaceImage(place, index = 0) {
  const title = String(place.title || '').toLowerCase();

  for (const preset of PLACE_IMAGE_PRESETS) {
    if (preset.keywords.some((keyword) => title.includes(keyword))) {
      return preset;
    }
  }

  return PLACE_IMAGE_PRESETS[index % PLACE_IMAGE_PRESETS.length];
}

function getPlaceAreaLabel(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return 'Location coming soon';
  }

  const vertical = lat >= 0 ? 'Northern' : 'Southern';
  const horizontal = lng >= 0 ? 'Eastern' : 'Western';

  return `${vertical} ${horizontal} side`;
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

function setupScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');

  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.12
  });

  items.forEach((item) => observer.observe(item));
}

/**
 * Returns the HTML for a star display (read-only).
 * @param {number|string} rating  1–5
 */
function starsHtml(rating) {
  const n = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < n ? 'star--filled' : ''}" aria-hidden="true">★</span>`
  ).join('');
  return `<div class="stars" role="img" aria-label="${n} out of 5 stars">${stars}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* =====================================================================
   Place details page
   ===================================================================== */

function getAuthToken() {
  return getCookie('token');
}

function getJwtIdentityFromToken(token) {
  if (!token) {
    return '';
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return '';
    }

    const normalized = payload.replaceAll('-', '+').replaceAll('_', '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    const padded = normalized + padding;
    const decoded = JSON.parse(atob(padded));
    return decoded.sub || decoded.identity || '';
  } catch {
    return '';
  }
}

function getJwtPayload(token) {
  if (!token) {
    return {};
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return {};
    }

    const normalized = payload.replaceAll('-', '+').replaceAll('_', '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(normalized + padding));
  } catch {
    return {};
  }
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function rememberPlace(place) {
  if (!place || !place.id) {
    return;
  }

  sessionStorage.setItem('last_place_id', place.id);
  sessionStorage.setItem('last_place_title', place.title || 'this place');
}

function getRememberedPlaceId() {
  return sessionStorage.getItem('last_place_id');
}

function setupPlacePage() {
  const detailsContainer = document.getElementById('place-details-content');

  if (!detailsContainer) {
    return;
  }

  const placeId = getPlaceIdFromURL();
  const token = getAuthToken();
  const heroActions = document.getElementById('place-hero-actions');
  const addReviewSection = document.getElementById('add-review');
  const addReviewLink = document.getElementById('add-review-link');
  const editPlaceSection = document.getElementById('edit-place');
  const editPlaceLink = document.getElementById('edit-place-link');

  if (heroActions) {
    heroActions.hidden = !token;
  }

  if (addReviewSection) {
    addReviewSection.hidden = !token;
  }

  if (addReviewLink && placeId) {
    addReviewLink.href = `add_review.html?id=${encodeURIComponent(placeId)}`;
  }

  if (editPlaceSection) {
    editPlaceSection.hidden = true;
  }

  if (editPlaceLink && placeId) {
    editPlaceLink.href = `add_place.html?id=${encodeURIComponent(placeId)}&mode=edit`;
  }

  if (!placeId) {
    const rememberedPlaceId = getRememberedPlaceId();

    if (rememberedPlaceId) {
      window.location.replace(`place.html?id=${encodeURIComponent(rememberedPlaceId)}`);
      return;
    }

    redirectToIndexWithNotice('Select a place from the home page to view its details.');
    return;
  }

  fetchPlaceDetails(token, placeId);
}

async function fetchPlaceDetails(token, placeId) {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/places/${encodeURIComponent(placeId)}`, { headers });
    const place = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(place.error || 'Unable to load place details.');
    }

    displayPlaceDetails(place);
  } catch (error) {
    setPlacesStatus('place-status', error.message, 'error');
    setPlacesStatus('reviews-status', 'Unable to load reviews.', 'error');
  }
}

function displayPlaceDetails(place) {
  const detailsContainer = document.getElementById('place-details-content');
  const reviewsList = document.getElementById('reviews-list');
  const placeStatus = document.getElementById('place-status');
  const reviewsStatus = document.getElementById('reviews-status');
  const placeHeroMeta = document.getElementById('place-hero-meta');
  const heroHeading = document.getElementById('page-hero-detail');
  const heroDescription = document.getElementById('place-hero-description');
  const heroActions = document.getElementById('place-hero-actions');
  const editPlaceSection = document.getElementById('edit-place');
  const editPlaceLink = document.getElementById('edit-place-link');
  const token = getAuthToken();
  const currentUserId = getJwtIdentityFromToken(token);
  const jwtPayload = getJwtPayload(token);
  const canModerateReviews = Boolean(jwtPayload.is_admin);
  const canEditPlace = Boolean(token) && (canModerateReviews || place.owner?.id === currentUserId);

  if (!detailsContainer || !reviewsList) {
    return;
  }

  if (placeStatus) {
    placeStatus.remove();
  }

  if (reviewsStatus) {
    reviewsStatus.remove();
  }

  const title = place.title || 'New stay';
  const owner = place.owner
    ? `${place.owner.first_name} ${place.owner.last_name}`.trim()
    : 'Unknown host';
  const description = place.description || 'A calm place with the essentials in place.';
  const price = Number(place.price) || 0;
  const amenities = Array.isArray(place.amenities) ? place.amenities : [];
  const reviews = Array.isArray(place.reviews) ? place.reviews : [];
  const amenityCount = amenities.length;
  const reviewCount = reviews.length;
  const averageRating = getAverageRating(reviews);
  const locationLabel = getPlaceLocationLabel(place);

  rememberPlace(place);
  if (heroActions) {
    heroActions.hidden = !token;
  }
  if (editPlaceSection) {
    editPlaceSection.hidden = !canEditPlace;
  }
  if (editPlaceLink && place.id) {
    editPlaceLink.href = `add_place.html?id=${encodeURIComponent(place.id)}&mode=edit`;
  }
  if (heroHeading) {
    heroHeading.textContent = title;
  }
  if (heroDescription) {
    heroDescription.textContent = description;
  }
  if (placeHeroMeta) {
    placeHeroMeta.innerHTML = `
      <span class="place-hero-chip">${escapeHtml(locationLabel)}</span>
      <span class="place-hero-chip">Hosted by ${escapeHtml(owner)}</span>
      <span class="place-hero-chip">$${price} per night</span>
      <span class="place-hero-chip">${amenityCount} amenit${amenityCount === 1 ? 'y' : 'ies'}</span>
      <span class="place-hero-chip">${averageRating ? `${averageRating.toFixed(1)} / 5` : 'No rating yet'}</span>
      <span class="place-hero-chip">${reviewCount} review${reviewCount === 1 ? '' : 's'}</span>
    `;
  }
  detailsContainer.innerHTML = `
    <article class="place-info place-info--rating">
      <h2>Average rating</h2>
      <div class="place-rating-summary">
        <strong>${averageRating ? averageRating.toFixed(1) : '—'}</strong>
        ${averageRating ? starsHtml(averageRating) : '<p class="place-rating-empty">No ratings yet</p>'}
      </div>
    </article>
    <article class="place-info">
      <h2>Amenities</h2>
      <ul class="amenities-list">${buildAmenitiesList(amenities)}</ul>
    </article>
  `;

  reviewsList.innerHTML = '';

  if (!reviews.length) {
    const emptyReviews = document.createElement('p');
    emptyReviews.className = 'places-status';
    emptyReviews.textContent = 'No reviews available for this place yet.';
    reviewsList.appendChild(emptyReviews);
    return;
  }

  reviews.forEach((review) => {
    const reviewCard = document.createElement('article');
    reviewCard.className = 'review-card';
    const initial = (review.user_id || '?').toString().charAt(0).toUpperCase();
    const canManageReview = Boolean(token) && (canModerateReviews || review.user_id === currentUserId);
    reviewCard.innerHTML = `
      <div class="review-card-header">
        <div class="review-avatar" aria-hidden="true">${escapeHtml(initial)}</div>
        <div>
          <h3>Guest ${escapeHtml(review.user_id || 'Unknown')}</h3>
          ${starsHtml(review.rating)}
        </div>
        ${canManageReview ? `
          <div class="review-card-actions">
            <a href="add_review.html?id=${encodeURIComponent(place.id)}&review=${encodeURIComponent(review.id || '')}&mode=edit" class="review-edit-button">Edit</a>
            <button type="button" class="review-delete-button" data-review-id="${escapeHtml(review.id || '')}">Delete</button>
          </div>
        ` : ''}
      </div>
      <p>${escapeHtml(review.text || '')}</p>
    `;

    const deleteButton = reviewCard.querySelector('.review-delete-button');
    if (deleteButton) {
      deleteButton.addEventListener('click', async () => {
        if (!token || !review.id || !window.confirm('Delete this review?')) {
          return;
        }

        deleteButton.disabled = true;

        try {
          await deleteReview(token, review.id);
          fetchPlaceDetails(token, place.id);
        } catch (error) {
          const inlineStatus = document.createElement('p');
          inlineStatus.className = 'places-status places-status--error';
          inlineStatus.setAttribute('role', 'alert');
          inlineStatus.setAttribute('aria-live', 'assertive');
          inlineStatus.textContent = error.message;
          reviewsList.prepend(inlineStatus);
          deleteButton.disabled = false;
        }
      });
    }

    reviewsList.appendChild(reviewCard);
  });
}

function buildAmenitiesList(amenities) {
  if (!amenities.length) {
    return '<li>No amenities listed.</li>';
  }

  return amenities
    .map((amenity) => `<li>${escapeHtml(amenity.name || 'Unnamed amenity')}</li>`)
    .join('');
}

function getAverageRating(reviews) {
  if (!reviews.length) {
    return 0;
  }

  const validRatings = reviews
    .map((review) => Number(review.rating))
    .filter((rating) => !Number.isNaN(rating) && rating > 0);

  if (!validRatings.length) {
    return 0;
  }

  const total = validRatings.reduce((sum, rating) => sum + rating, 0);
  return total / validRatings.length;
}

function setPlacesStatus(id, message, type = 'status') {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = message;
    const isError = type === 'error';
    element.setAttribute('role', isError ? 'alert' : 'status');
    element.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    element.setAttribute('aria-atomic', 'true');
    element.classList.toggle('places-status--error', isError);
  }
}

/* =====================================================================
   Add review page
   ===================================================================== */

function setupAddReviewPage() {
  const reviewForm = document.getElementById('review-form');

  if (!reviewForm) {
    return;
  }

  const token = getAuthToken();

  if (!token) {
    redirectToIndexWithNotice('Please log in before adding a review.');
    return;
  }

  const placeId = getPlaceIdFromURL();
  const messageElement = document.getElementById('review-message');
  const params = new URLSearchParams(window.location.search);
  const reviewId = params.get('review');
  const editMode = params.get('mode') === 'edit' && Boolean(reviewId);
  const pageTitle = document.getElementById('page-hero-review');
  const pageCopy = document.querySelector('.page-hero-copy');
  const formHeading = document.getElementById('review-heading');
  const formCopy = document.querySelector('#review-form .form-copy');
  const submitButton = document.getElementById('review-submit-button');

  if (!placeId) {
    const rememberedPlaceId = getRememberedPlaceId();

    if (rememberedPlaceId) {
      window.location.replace(`add_review.html?id=${encodeURIComponent(rememberedPlaceId)}`);
      return;
    }

    redirectToIndexWithNotice('Open a place before trying to add a review.');
    return;
  }

  if (editMode) {
    if (pageTitle) pageTitle.textContent = 'Refine your review.';
    if (pageCopy) pageCopy.textContent = 'Adjust the wording or rating, then save the updated version.';
    if (formHeading) formHeading.textContent = 'Edit Review';
    if (formCopy) formCopy.innerHTML = 'You are updating your review for <strong id="reviewed-place-name">this place</strong>.';
    if (submitButton) submitButton.textContent = 'Save Review';
  }

  initializeReviewContext(reviewForm, messageElement, token, placeId, reviewId, editMode);

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const reviewInput = document.getElementById('review');
    const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
    const submitButton = reviewForm.querySelector('button[type="submit"]');

    if (!reviewInput || !submitButton || !messageElement) {
      return;
    }

    if (reviewForm.dataset.reviewLocked === 'own-place') {
      setMessage(messageElement, 'You cannot review your own place.', 'error');
      return;
    }

    if (!editMode && reviewForm.dataset.reviewLocked === 'already-reviewed') {
      setMessage(messageElement, 'You have already reviewed this place.', 'error');
      return;
    }

    setFieldValidity(reviewInput, false);

    if (!reviewInput.value.trim()) {
      setFieldValidity(reviewInput, true);
      setMessage(messageElement, 'Write a few words before sending your review.', 'error');
      reviewInput.focus();
      return;
    }

    if (!ratingInput) {
      setMessage(messageElement, 'Please select a star rating.', 'error');
      const firstRating = reviewForm.querySelector('input[name="rating"]');
      if (firstRating) {
        firstRating.focus();
      }
      return;
    }

    setMessage(messageElement, editMode ? 'Saving review…' : 'Submitting review…', 'success');
    submitButton.disabled = true;
    reviewForm.setAttribute('aria-busy', 'true');

    try {
      if (editMode) {
        await updateReview(token, reviewId, placeId, reviewInput.value.trim(), ratingInput.value);
        setMessage(messageElement, 'Review updated successfully.', 'success');
      } else {
        await submitReview(token, placeId, reviewInput.value.trim(), ratingInput.value);
        setMessage(messageElement, 'Review submitted successfully.', 'success');
        reviewForm.reset();
      }
    } catch (error) {
      setMessage(messageElement, error.message, 'error');
    } finally {
      submitButton.disabled = false;
      reviewForm.removeAttribute('aria-busy');
    }
  });
}

async function initializeReviewContext(reviewForm, messageElement, token, placeId, reviewId = '', editMode = false) {
  const placeNameElement = document.getElementById('reviewed-place-name');
  const reviewInput = document.getElementById('review');
  const ratingInputs = reviewForm ? Array.from(reviewForm.querySelectorAll('input[name="rating"]')) : [];
  const submitButton = reviewForm ? reviewForm.querySelector('button[type="submit"]') : null;
  const headers = {};
  const currentUserId = getJwtIdentityFromToken(token);
  const jwtPayload = getJwtPayload(token);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/places/${encodeURIComponent(placeId)}`, { headers });
    const place = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error();
    }

    if (placeNameElement) {
      placeNameElement.textContent = place.title || 'this place';
    }

    if (!reviewForm || !messageElement) {
      return;
    }

    reviewForm.dataset.reviewLocked = '';

    if (!editMode && place.owner?.id === currentUserId) {
      reviewForm.dataset.reviewLocked = 'own-place';
      setMessage(messageElement, 'You cannot review your own place.', 'error');
    } else if (!editMode && Array.isArray(place.reviews) && place.reviews.some((review) => review.user_id === currentUserId)) {
      reviewForm.dataset.reviewLocked = 'already-reviewed';
      setMessage(messageElement, 'You have already reviewed this place.', 'error');
    }

    const isLocked = Boolean(reviewForm.dataset.reviewLocked);
    if (reviewInput) {
      reviewInput.disabled = isLocked;
    }
    ratingInputs.forEach((input) => {
      input.disabled = isLocked;
    });
    if (submitButton) {
      submitButton.disabled = isLocked;
    }

    if (editMode && reviewId) {
      const reviewResponse = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, { headers });
      const review = await reviewResponse.json().catch(() => ({}));

      if (!reviewResponse.ok) {
        throw new Error(review.error || 'Unable to load review.');
      }

      const canEditReview = Boolean(jwtPayload.is_admin) || review.user_id === currentUserId;
      if (!canEditReview) {
        redirectToIndexWithNotice('You can only edit your own reviews.');
        return;
      }

      if (review.place_id !== placeId) {
        throw new Error('This review does not belong to the current place.');
      }

      if (reviewInput) {
        reviewInput.disabled = false;
        reviewInput.value = review.text || '';
      }

      ratingInputs.forEach((input) => {
        input.disabled = false;
        input.checked = String(review.rating) === input.value;
      });

      if (submitButton) {
        submitButton.disabled = false;
      }

      reviewForm.dataset.reviewLocked = '';
    }
  } catch {
    if (placeNameElement) {
      placeNameElement.textContent = 'this place';
    }
  }
}

async function submitReview(token, placeId, reviewText, rating) {
  const response = await fetch(`${API_BASE_URL}/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      text: reviewText,
      rating: Number(rating),
      place_id: placeId
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your session is no longer valid. Please log in again.');
    }
    throw new Error(data.error || 'Failed to submit review.');
  }

  return data;
}

async function updateReview(token, reviewId, placeId, reviewText, rating) {
  const response = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      text: reviewText,
      rating: Number(rating),
      place_id: placeId,
      user_id: getJwtIdentityFromToken(token)
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your session is no longer valid. Please log in again.');
    }
    throw new Error(data.error || 'Failed to update review.');
  }

  return data;
}

async function deleteReview(token, reviewId) {
  const response = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete review.');
  }

  return data;
}

/* =====================================================================
   Add place page
   ===================================================================== */

function setupAddPlacePage() {
  const placeForm = document.getElementById('place-form');

  if (!placeForm) {
    return;
  }

  const token = getAuthToken();
  const params = new URLSearchParams(window.location.search);
  const placeId = params.get('id');
  const editMode = params.get('mode') === 'edit' && Boolean(placeId);
  const pageKicker = document.getElementById('place-page-kicker');
  const pageTitle = document.getElementById('page-hero-place');
  const pageCopy = document.getElementById('place-page-copy');
  const formHeading = document.getElementById('place-form-heading');
  const formCopy = document.getElementById('place-form-copy');
  const submitButton = document.getElementById('place-submit-button');

  if (!token) {
    redirectToIndexWithNotice('Please log in before publishing a place.');
    return;
  }

  if (editMode) {
    if (pageKicker) pageKicker.textContent = 'Refine the details';
    if (pageTitle) pageTitle.textContent = 'Edit your place.';
    if (pageCopy) pageCopy.textContent = 'Adjust the details, amenities, or location and save when everything feels right.';
    if (formHeading) formHeading.textContent = 'Edit Place';
    if (formCopy) formCopy.textContent = 'Update the essentials and save the latest version.';
    if (submitButton) submitButton.textContent = 'Save Changes';
  }

  loadAmenities(token, editMode ? placeId : '');

  placeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const titleInput = document.getElementById('place-title');
    const descriptionInput = document.getElementById('place-description');
    const priceInput = document.getElementById('place-price');
    const locationInput = document.getElementById('place-location-name');
    const latitudeInput = document.getElementById('place-latitude');
    const longitudeInput = document.getElementById('place-longitude');
    const messageElement = document.getElementById('place-message');
    if (!titleInput || !descriptionInput || !priceInput || !locationInput || !latitudeInput || !longitudeInput || !messageElement || !submitButton) {
      return;
    }

    clearFieldValidity(titleInput, descriptionInput, priceInput, locationInput, latitudeInput, longitudeInput);

    if (!titleInput.value.trim()) {
      setFieldValidity(titleInput, true);
      setMessage(messageElement, 'Add a title for your place.', 'error');
      titleInput.focus();
      return;
    }

    if (priceInput.value === '' || Number(priceInput.value) < 0) {
      setFieldValidity(priceInput, true);
      setMessage(messageElement, 'Enter a valid nightly price.', 'error');
      priceInput.focus();
      return;
    }

    if (!locationInput.value.trim()) {
      setFieldValidity(locationInput, true);
      setMessage(messageElement, 'Add a readable location for the place.', 'error');
      locationInput.focus();
      return;
    }

    if (latitudeInput.value === '' || Number(latitudeInput.value) < -90 || Number(latitudeInput.value) > 90) {
      setFieldValidity(latitudeInput, true);
      setMessage(messageElement, 'Latitude must be between -90 and 90.', 'error');
      latitudeInput.focus();
      return;
    }

    if (longitudeInput.value === '' || Number(longitudeInput.value) < -180 || Number(longitudeInput.value) > 180) {
      setFieldValidity(longitudeInput, true);
      setMessage(messageElement, 'Longitude must be between -180 and 180.', 'error');
      longitudeInput.focus();
      return;
    }

    const selectedAmenities = Array.from(placeForm.querySelectorAll('input[name="amenities"]:checked'))
      .map((input) => input.value);

    setMessage(messageElement, editMode ? 'Saving changes…' : 'Publishing place…', 'success');
    submitButton.disabled = true;
    placeForm.setAttribute('aria-busy', 'true');

    try {
      const payload = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        price: Number(priceInput.value),
        latitude: Number(latitudeInput.value),
        longitude: Number(longitudeInput.value),
        owner_id: getJwtIdentityFromToken(token) || 'current-user',
        amenities: selectedAmenities
      };

      const savedPlace = editMode
        ? await updatePlace(token, placeId, payload)
        : await submitPlace(token, payload);

      setStoredPlaceLocation(savedPlace.id, locationInput.value.trim());
      setSiteNotice(editMode ? 'Place updated successfully.' : 'Place published successfully.');
      window.location.href = `place.html?id=${encodeURIComponent(savedPlace.id)}`;
    } catch (error) {
      setMessage(messageElement, error.message, 'error');
    } finally {
      submitButton.disabled = false;
      placeForm.removeAttribute('aria-busy');
    }
  });
}

async function loadAmenities(token, selectedPlaceId = '') {
  const amenitiesContainer = document.getElementById('amenities-options');
  const amenitiesStatus = document.getElementById('amenities-status');
  const headers = {};

  if (!amenitiesContainer) {
    return;
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/amenities/`, { headers });
    const amenities = await response.json().catch(() => []);

    if (!response.ok) {
      throw new Error('Unable to load amenities.');
    }

    amenitiesContainer.innerHTML = '';

    if (!Array.isArray(amenities) || !amenities.length) {
      amenitiesContainer.innerHTML = '<p class="amenities-empty">No amenities available right now.</p>';
      return;
    }

    amenities.forEach((amenity) => {
      const label = document.createElement('label');
      label.className = 'amenity-option';
      label.innerHTML = `
        <input type="checkbox" name="amenities" value="${escapeHtml(amenity.id)}">
        <span>${escapeHtml(amenity.name)}</span>
      `;
      amenitiesContainer.appendChild(label);
    });

    if (amenitiesStatus) {
      amenitiesStatus.remove();
    }

    if (selectedPlaceId) {
      await prefillPlaceFormForEdit(token, selectedPlaceId);
    }
  } catch (error) {
    if (amenitiesStatus) {
      amenitiesStatus.textContent = error.message;
      amenitiesStatus.classList.add('places-status--error');
    }
  }
}

async function prefillPlaceFormForEdit(token, placeId) {
  const titleInput = document.getElementById('place-title');
  const descriptionInput = document.getElementById('place-description');
  const priceInput = document.getElementById('place-price');
  const locationInput = document.getElementById('place-location-name');
  const latitudeInput = document.getElementById('place-latitude');
  const longitudeInput = document.getElementById('place-longitude');
  const messageElement = document.getElementById('place-message');
  const currentUserId = getJwtIdentityFromToken(token);
  const jwtPayload = getJwtPayload(token);
  const headers = { Authorization: `Bearer ${token}` };

  if (!titleInput || !descriptionInput || !priceInput || !locationInput || !latitudeInput || !longitudeInput) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/places/${encodeURIComponent(placeId)}`, { headers });
    const place = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(place.error || 'Unable to load place.');
    }

    const canEditPlace = Boolean(jwtPayload.is_admin) || place.owner?.id === currentUserId;

    if (!canEditPlace) {
      redirectToIndexWithNotice('You can only edit your own places.');
      return;
    }

    titleInput.value = place.title || '';
    descriptionInput.value = place.description || '';
    priceInput.value = Number(place.price) || '';
    latitudeInput.value = Number(place.latitude) || '';
    longitudeInput.value = Number(place.longitude) || '';
    locationInput.value = getPlaceLocationLabel(place) || '';

    const amenityIds = new Set((Array.isArray(place.amenities) ? place.amenities : []).map((amenity) => amenity.id));
    document.querySelectorAll('input[name="amenities"]').forEach((input) => {
      input.checked = amenityIds.has(input.value);
    });
  } catch (error) {
    if (messageElement) {
      setMessage(messageElement, error.message, 'error');
    }
  }
}

async function submitPlace(token, payload) {
  const response = await fetch(`${API_BASE_URL}/places/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      document.cookie = 'token=; max-age=0; path=/; SameSite=Lax';
      throw new Error('Your session is no longer valid. Please log in again.');
    }

    const detailedMessage = data.error || data.message || (
      data.errors ? Object.values(data.errors).join(' ') : ''
    );
    throw new Error(detailedMessage || 'Failed to publish place.');
  }

  return data;
}

async function updatePlace(token, placeId, payload) {
  const response = await fetch(`${API_BASE_URL}/places/${encodeURIComponent(placeId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      document.cookie = 'token=; max-age=0; path=/; SameSite=Lax';
      throw new Error('Your session is no longer valid. Please log in again.');
    }

    const detailedMessage = data.error || data.message || (
      data.errors ? Object.values(data.errors).join(' ') : ''
    );
    throw new Error(detailedMessage || 'Failed to update place.');
  }

  return data;
}

async function deletePlace(token, placeId) {
  const response = await fetch(`${API_BASE_URL}/places/${encodeURIComponent(placeId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      document.cookie = 'token=; max-age=0; path=/; SameSite=Lax';
      throw new Error('Your session is no longer valid. Please log in again.');
    }
    throw new Error(data.error || 'Failed to delete place.');
  }
}
