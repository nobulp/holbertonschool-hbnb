const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';
let allPlaces = [];

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
  setupPlacePage();
  setupAddReviewPage();
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

  if (loginLink) {
    loginLink.hidden = !!token;
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

  const updateHeaderState = () => {
    document.body.classList.toggle('header-condensed', window.scrollY > 18);
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
    displayPlaces(allPlaces);
    applyCurrentFilter();
  } catch (error) {
    setPlacesStatus('places-status', error.message, 'error');
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
    placeCard.dataset.reveal = 'card';

    const title = place.title || 'Untitled place';
    const price = Number(place.price) || 0;
    const placeId = place.id || '';
    const area = getPlaceAreaLabel(place.latitude, place.longitude);
    const rateLabel = getRateLabel(price);
    const summary = getPlaceSummary(price, area);
    const imageSrc = getPlaceImage(place);

    placeCard.innerHTML = `
      <div class="place-media">
        <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(title)}" loading="lazy">
      </div>
      <p class="place-kicker">${escapeHtml(rateLabel)}</p>
      <h2>${escapeHtml(title)}</h2>
      <p class="place-location">${escapeHtml(area)}</p>
      <p class="price-tag"><strong>$${price}</strong> / night</p>
      <p class="place-summary">${escapeHtml(summary)}</p>
      <a href="place.html?id=${encodeURIComponent(placeId)}" class="details-button" aria-label="View details for ${escapeHtml(title)}">View Details</a>
    `;

    const detailsLink = placeCard.querySelector('.details-button');
    if (detailsLink) {
      detailsLink.addEventListener('click', () => {
        rememberPlace(place);
      });
    }

    placesList.appendChild(placeCard);
  });

  setupScrollReveal();
}

function getPlaceImage(place) {
  const gallery = ['place-lake.svg', 'place-forest.svg', 'place-city.svg'];
  const seed = `${place.id || ''}${place.title || ''}${place.price || ''}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return gallery[hash % gallery.length];
}

function getPlaceAreaLabel(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return 'Location shown on the detail page';
  }

  const vertical = lat >= 0 ? 'Northern' : 'Southern';
  const horizontal = lng >= 0 ? 'Eastern' : 'Western';

  return `${vertical} ${horizontal} area`;
}

function getRateLabel(price) {
  if (price <= 20) {
    return 'Lower nightly rate';
  }

  if (price <= 60) {
    return 'Mid-range nightly rate';
  }

  return 'Higher nightly rate';
}

function getPlaceSummary(price, area) {
  if (price <= 20) {
    return `A simpler stay with a lighter nightly rate, located in the ${area.toLowerCase()}.`;
  }

  if (price <= 60) {
    return `A balanced option with a moderate nightly rate, located in the ${area.toLowerCase()}.`;
  }

  return `A more premium option with a higher nightly rate, located in the ${area.toLowerCase()}.`;
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
  const addReviewSection = document.getElementById('add-review');
  const addReviewLink = document.getElementById('add-review-link');

  if (addReviewSection) {
    addReviewSection.hidden = !token;
  }

  if (addReviewLink && placeId) {
    addReviewLink.href = `add_review.html?id=${encodeURIComponent(placeId)}`;
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
  const placeTitle = document.getElementById('place-title');
  const detailsContainer = document.getElementById('place-details-content');
  const reviewsList = document.getElementById('reviews-list');
  const placeStatus = document.getElementById('place-status');
  const reviewsStatus = document.getElementById('reviews-status');
  const placeHeroMeta = document.getElementById('place-hero-meta');
  const heroHeading = document.getElementById('page-hero-detail');

  if (!placeTitle || !detailsContainer || !reviewsList) {
    return;
  }

  if (placeStatus) {
    placeStatus.remove();
  }

  if (reviewsStatus) {
    reviewsStatus.remove();
  }

  const title = place.title || 'Untitled place';
  const owner = place.owner
    ? `${place.owner.first_name} ${place.owner.last_name}`.trim()
    : 'Unknown host';
  const description = place.description || 'No description available.';
  const price = Number(place.price) || 0;
  const amenities = Array.isArray(place.amenities) ? place.amenities : [];
  const reviews = Array.isArray(place.reviews) ? place.reviews : [];
  const amenityCount = amenities.length;
  const reviewCount = reviews.length;

  rememberPlace(place);
  placeTitle.textContent = title;
  if (heroHeading) {
    heroHeading.textContent = title;
  }
  if (placeHeroMeta) {
    placeHeroMeta.innerHTML = `
      <span class="place-hero-chip">Hosted by ${escapeHtml(owner)}</span>
      <span class="place-hero-chip">$${price} per night</span>
      <span class="place-hero-chip">${amenityCount} amenit${amenityCount === 1 ? 'y' : 'ies'}</span>
      <span class="place-hero-chip">${reviewCount} review${reviewCount === 1 ? '' : 's'}</span>
    `;
  }
  detailsContainer.innerHTML = `
    <article class="place-info">
      <h2>Host</h2>
      <p>${escapeHtml(owner)}</p>
    </article>
    <article class="place-info">
      <h2>Price</h2>
      <p>$${price} per night</p>
    </article>
    <article class="place-info">
      <h2>Description</h2>
      <p>${escapeHtml(description)}</p>
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
    reviewCard.innerHTML = `
      <div class="review-card-header">
        <div class="review-avatar" aria-hidden="true">${escapeHtml(initial)}</div>
        <div>
          <h3>Guest ${escapeHtml(review.user_id || 'Unknown')}</h3>
          ${starsHtml(review.rating)}
        </div>
      </div>
      <p>${escapeHtml(review.text || '')}</p>
    `;
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

  if (!placeId) {
    const rememberedPlaceId = getRememberedPlaceId();

    if (rememberedPlaceId) {
      window.location.replace(`add_review.html?id=${encodeURIComponent(rememberedPlaceId)}`);
      return;
    }

    redirectToIndexWithNotice('Open a place before trying to add a review.');
    return;
  }

  loadReviewedPlaceName(token, placeId);

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const reviewInput = document.getElementById('review');
    const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
    const submitButton = reviewForm.querySelector('button[type="submit"]');

    if (!reviewInput || !submitButton || !messageElement) {
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

    setMessage(messageElement, 'Submitting review…', 'success');
    submitButton.disabled = true;
    reviewForm.setAttribute('aria-busy', 'true');

    try {
      await submitReview(token, placeId, reviewInput.value.trim(), ratingInput.value);
      setMessage(messageElement, 'Review submitted successfully.', 'success');
      reviewForm.reset();
    } catch (error) {
      setMessage(messageElement, error.message, 'error');
    } finally {
      submitButton.disabled = false;
      reviewForm.removeAttribute('aria-busy');
    }
  });
}

async function loadReviewedPlaceName(token, placeId) {
  const placeNameElement = document.getElementById('reviewed-place-name');
  const reviewHeroMeta = document.getElementById('review-hero-meta');
  const headers = {};

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
    if (reviewHeroMeta) {
      reviewHeroMeta.innerHTML = `
        <span class="review-hero-chip">Reviewing ${escapeHtml(place.title || 'this place')}</span>
        <span class="review-hero-chip">1 to 5 stars</span>
        <span class="review-hero-chip">Signed-in guests only</span>
      `;
    }
  } catch {
    if (placeNameElement) {
      placeNameElement.textContent = 'this place';
    }
    if (reviewHeroMeta) {
      reviewHeroMeta.innerHTML = `
        <span class="review-hero-chip">Reviewing this place</span>
        <span class="review-hero-chip">1 to 5 stars</span>
        <span class="review-hero-chip">Signed-in guests only</span>
      `;
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
    throw new Error(data.error || 'Failed to submit review.');
  }

  return data;
}
