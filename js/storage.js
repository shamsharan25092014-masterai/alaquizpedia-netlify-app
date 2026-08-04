/* ================================================
   storage.js — Local Storage DB wrapper
   ALA QUIZPEDIA by A.SHAM SHARAN
   ================================================ */

const DB_KEY = 'alaquizpedia_db';

function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return { users: [], quizzes: [], scores: [], images: [], materials: [] };
  const parsed = JSON.parse(raw);
  if (!parsed.images) parsed.images = [];
  if (!parsed.materials) parsed.materials = [];
  return parsed;
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Image Gallery Management
function getImages() {
  return getDB().images || [];
}

function addImage(name, data) {
  const db = getDB();
  if (!db.images) db.images = [];
  const img = { id: 'img-' + Date.now() + '-' + Math.floor(Math.random() * 1000), name, data };
  db.images.push(img);
  saveDB(db);
  return img;
}

function deleteImage(id) {
  const db = getDB();
  if (db.images) {
    db.images = db.images.filter(img => img.id !== id);
  }
  if (db.quizzes) {
    db.quizzes.forEach(q => {
      if (q.imageId === id) q.imageId = '';
      if (q.questions) {
        q.questions.forEach(ques => {
          if (ques.imageId === id) ques.imageId = '';
        });
      }
    });
  }
  saveDB(db);
}

// Import/Export helper
function importDatabase(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    if (!data.users || !data.quizzes || !data.scores) {
      return { success: false, error: 'Invalid file format. Missing core tables.' };
    }
    const db = getDB();
    db.users = data.users;
    db.quizzes = data.quizzes;
    db.scores = data.scores;
    db.images = data.images || [];
    db.materials = data.materials || [];
    saveDB(db);
    // Seed admin again if deleted during import
    seedAdmin();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}


function seedAdmin() {
  const db = getDB();
  // Clean up any admin that doesn't have the username 'admin'
  db.users = db.users.filter(u => !(u.role === 'admin' && u.username !== 'admin'));

  const adminExists = db.users.find(u => u.username === 'admin');
  if (!adminExists) {
    db.users.push({
      id: 'admin-001',
      username: 'admin',
      password: btoa('Admin@1234'), // base64 (demo only, not real crypto)
      role: 'admin',
      displayName: 'A.SHAM SHARAN',
      createdAt: new Date().toISOString()
    });
    saveDB(db);
  }
}

// Username validation: must match XXXX-XXXX (4 digits, dash, 4 digits)
function isValidUsername(username) {
  return /^\d{4}-\d{4}$/.test(username);
}

// Password validation rules
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('At least one special character (!@#$%...)');
  return errors;
}

function registerUser(username, password, displayName) {
  // Admin can register any username, users must follow XXXX-XXXX format
  if (!isValidUsername(username)) {
    return { success: false, error: 'Username must be in format XXXX-XXXX (e.g. 1234-5678)' };
  }
  const pwErrors = validatePassword(password);
  if (pwErrors.length > 0) {
    return { success: false, error: 'Password too weak: ' + pwErrors.join(', ') };
  }
  const db = getDB();
  if (db.users.find(u => u.username === username)) {
    return { success: false, error: 'Username already taken' };
  }
  const user = {
    id: 'u-' + Date.now(),
    username,
    password: btoa(password),
    role: 'user',
    displayName: displayName || username,
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  saveDB(db);
  return { success: true, user };
}

function loginUser(username, password) {
  const db = getDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return { success: false, error: 'User not found' };
  if (atob(user.password) !== password) return { success: false, error: 'Incorrect password' };
  return { success: true, user };
}

// Quiz CRUD
function getAllQuizzes() {
  return getDB().quizzes;
}

function getQuizById(id) {
  return getDB().quizzes.find(q => q.id === id);
}

function saveQuiz(quiz) {
  const db = getDB();
  const idx = db.quizzes.findIndex(q => q.id === quiz.id);
  if (idx > -1) {
    db.quizzes[idx] = quiz;
  } else {
    db.quizzes.push(quiz);
  }
  saveDB(db);
}

function deleteQuiz(id) {
  const db = getDB();
  db.quizzes = db.quizzes.filter(q => q.id !== id);
  db.scores = db.scores.filter(s => s.quizId !== id);
  saveDB(db);
}

// Scores
function submitScore(scoreEntry) {
  const db = getDB();
  db.scores.push(scoreEntry);
  saveDB(db);
}

function getLeaderboard() {
  const db = getDB();
  // Aggregate best score per user
  const best = {};
  db.scores.forEach(s => {
    const pct = Math.round((s.score / s.totalQuestions) * 100);
    if (!best[s.userId] || pct > best[s.userId].pct) {
      best[s.userId] = { ...s, pct };
    }
  });
  return Object.values(best).sort((a, b) => b.pct - a.pct);
}

function getUserScores(userId) {
  return getDB().scores.filter(s => s.userId === userId);
}

// Quiz card renderer (shared)
function renderQuizCard(quiz) {
  const catClass = `cat-${(quiz.category || 'general').toLowerCase()}`;
  const qCount = (quiz.questions || []).length;
  const timeMin = quiz.timePerQuestion ? Math.round(qCount * quiz.timePerQuestion / 60) : qCount;
  
  let imgHtml = '';
  if (quiz.imageId) {
    const images = getImages();
    const imgObj = images.find(img => img.id === quiz.imageId);
    if (imgObj && imgObj.data) {
      imgHtml = `<img src="${imgObj.data}" alt="Quiz Cover" class="quiz-card-img" style="width:100%; height:150px; object-fit:cover; border-radius:12px 12px 0 0; margin-bottom: 0.5rem;" />`;
    }
  }

  return `
    <div class="quiz-card animate-in" onclick="window.location='quiz-player.html?id=${quiz.id}'">
      ${imgHtml}
      <div class="card-header">
        <span class="card-category ${catClass}">${quiz.category || 'General'}</span>
        <span class="text-muted" style="font-size:0.8rem">⏱ ~${timeMin} min</span>
      </div>
      <div class="card-title">${quiz.title}</div>
      <div class="card-desc">${quiz.description || 'Test your knowledge!'}</div>
      <div class="card-meta">
        <span>📝 ${qCount} Questions</span>
        <span>🎯 ${quiz.difficulty || 'Mixed'}</span>
      </div>
    </div>
  `;
}

// Initialize DB
seedAdmin();
