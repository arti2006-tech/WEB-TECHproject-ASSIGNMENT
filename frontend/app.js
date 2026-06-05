const API_BASE = 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

async function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.getElementById('navLinks').classList.remove('open');

  if (page === 'home') {
    await loadHome();
  }
  updateNav();
}

function updateNav() {
  const token = getToken();
  document.getElementById('navLogin').style.display = token ? 'none' : '';
  document.getElementById('navRegister').style.display = token ? 'none' : '';
  document.getElementById('navLogout').style.display = token ? '' : 'none';
}

async function loadHome() {
  const homeContent = document.getElementById('homeContent');
  const dashboardContent = document.getElementById('dashboardContent');
  const heroCta = document.getElementById('heroCta');
  const token = getToken();

  if (!token) {
    homeContent.style.display = 'block';
    dashboardContent.style.display = 'none';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/home`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 401) {
        removeToken();
        showToast('Session expired. Please login again.', 'error');
        homeContent.style.display = 'block';
        dashboardContent.style.display = 'none';
        updateNav();
        return;
      }
      throw new Error('Failed to load home');
    }

    const data = await res.json();
    homeContent.style.display = 'none';
    dashboardContent.style.display = 'block';

    document.getElementById('dashUsername').textContent = data.user.username;
    document.getElementById('dashMessage').textContent = data.message;
    document.getElementById('dashAvatar').innerHTML = `<span style="font-weight:700;font-size:1.4rem">${data.user.username.charAt(0).toUpperCase()}</span>`;
    document.getElementById('statUsername').textContent = data.user.username;
    document.getElementById('statEmail').textContent = data.user.email;
    document.getElementById('statId').textContent = `#${data.user.id}`;
    document.getElementById('statTime').textContent = new Date(data.timestamp).toLocaleString();
  } catch (err) {
    homeContent.style.display = 'block';
    dashboardContent.style.display = 'none';
  }
}

async function fetchProfile() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed');

    const data = await res.json();
    document.getElementById('statUsername').textContent = data.username;
    document.getElementById('statEmail').textContent = data.email;
    document.getElementById('statId').textContent = `#${data.id}`;
    document.getElementById('statTime').textContent = new Date().toLocaleString();
    showToast('Profile data refreshed!', 'success');
  } catch (err) {
    showToast('Failed to refresh data', 'error');
  }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Login failed';
      return;
    }

    setToken(data.token);
    errorEl.textContent = '';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    showToast(`Welcome back, ${data.user.username}!`, 'success');
    await showPage('home');
  } catch (err) {
    errorEl.textContent = 'Cannot connect to server';
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const errorEl = document.getElementById('registerError');

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Registration failed';
      return;
    }

    setToken(data.token);
    errorEl.textContent = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    showToast(`Welcome, ${data.user.username}!`, 'success');
    await showPage('home');
  } catch (err) {
    errorEl.textContent = 'Cannot connect to server';
  }
});

function logout() {
  removeToken();
  showPage('login');
  updateNav();
  showToast('Logged out successfully', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    showPage('home');
  } else {
    showPage('login');
  }
});
