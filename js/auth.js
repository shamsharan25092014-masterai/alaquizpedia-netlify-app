/* ================================================
   auth.js — Session management
   ALA QUIZPEDIA by A.SHAM SHARAN
   ================================================ */

const SESSION_KEY = 'alaquizpedia_session';

function getCurrentUser() {
  const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

function setCurrentUser(user, remember = false) {
  const data = JSON.stringify(user);
  sessionStorage.setItem(SESSION_KEY, data);
  if (remember) localStorage.setItem(SESSION_KEY, data);
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

function requireAuth(redirectTo = 'login.html') {
  if (!getCurrentUser()) {
    window.location.href = redirectTo;
    return null;
  }
  return getCurrentUser();
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}
