/* ================================================
   app.js — Global UI helpers (navbar, toast, etc.)
   ALA QUIZPEDIA by A.SHAM SHARAN
   ================================================ */

// ---- Navbar scroll effect ----
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ---- Hamburger ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ---- Auth state in navbar ----
(function updateNavAuth() {
  const user = getCurrentUser();
  const navAuth = document.getElementById('navAuth');
  const navUser = document.getElementById('navUser');
  const userAvatar = document.getElementById('userAvatar');
  const userDisplayName = document.getElementById('userDisplayName');
  const adminLink = document.getElementById('adminLink');

  if (user) {
    if (navAuth) navAuth.classList.add('hidden');
    if (navUser) navUser.classList.remove('hidden');
    if (userAvatar) userAvatar.textContent = (user.displayName || user.username)[0].toUpperCase();
    if (userDisplayName) userDisplayName.textContent = user.displayName || user.username;
    if (adminLink && user.role === 'admin') adminLink.classList.remove('hidden');
  } else {
    if (navAuth) navAuth.classList.remove('hidden');
    if (navUser) navUser.classList.add('hidden');
  }

  // Dropdown toggle
  const menuBtn = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdown');
  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => dropdown.classList.add('hidden'));
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  }
})();

// ---- Toast Notifications ----
function showToast(message, type = 'info', duration = 3500) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- Animate-in on scroll ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('animate-in');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.quiz-card, .feature-card, .stat-box').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

// ---- Utility: generate unique ID ----
function genId(prefix = 'q') {
  return prefix + '-' + Math.random().toString(36).substr(2, 9);
}

// ---- Utility: format date ----
function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---- Utility: category CSS class ----
function catClass(cat) {
  const map = {
    science: 'cat-science', history: 'cat-history', geography: 'cat-geography',
    sports: 'cat-sports', technology: 'cat-technology', general: 'cat-general'
  };
  return map[(cat||'').toLowerCase()] || 'cat-default';
}
