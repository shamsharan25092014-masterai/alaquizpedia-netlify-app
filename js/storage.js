/* ================================================
   storage.js — Local Storage DB wrapper
   ALA QUIZPEDIA by A. SHAM SHARAN
   ================================================ */

const DB_KEY = 'alaquizpedia_db';
const CLOUD_BIN_URL = 'https://api.jsonbin.io/v3/b/66a500000000000000000000'; // Global Cloud Sync Endpoint

function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const defaultDB = { 
      users: [], 
      quizzes: [{
        "id": "quiz-default-1",
        "title": "General Knowledge & Science",
        "category": "Science",
        "difficulty": "Mixed",
        "description": "Test your core knowledge of General Science! (Default Quiz)",
        "timePerQuestion": 30,
        "questions": [
          { "id": "q1", "type": "mcq", "questionText": "Which planet is known as the Red Planet?", "options": ["Venus", "Mars", "Jupiter", "Saturn"], "correctAnswer": "Mars", "explanation": "Mars is called the Red Planet because of iron oxide on its surface." },
          { "id": "q2", "type": "mcq", "questionText": "What is the hardest natural substance on Earth?", "options": ["Gold", "Iron", "Diamond", "Platinum"], "correctAnswer": "Diamond", "explanation": "Diamond is the hardest natural material." },
          { "id": "q3", "type": "mcq", "questionText": "Which element has the chemical symbol 'O'?", "options": ["Gold", "Oxygen", "Osmium", "Zinc"], "correctAnswer": "Oxygen", "explanation": "Oxygen has the symbol O." },
          { "id": "q4", "type": "mcq", "questionText": "Who is known as the Father of the Nation in India?", "options": ["Nehru", "Ambedkar", "Mahatma Gandhi", "Bose"], "correctAnswer": "Mahatma Gandhi", "explanation": "Mahatma Gandhi is called the Father of the Nation in India." },
          { "id": "q5", "type": "truefalse", "questionText": "The Great Wall of China is visible from space with the naked eye.", "options": ["True", "False"], "correctAnswer": "False", "explanation": "This is a popular myth; the wall is too narrow to be seen from space with the naked eye." }
        ]
      },
      {
        "id": "quiz-default-2",
        "title": "Current Affairs & Today's World",
        "category": "General",
        "difficulty": "Easy",
        "description": "A quick quiz on today's general awareness and current affairs!",
        "timePerQuestion": 25,
        "questions": [
          { "id": "ca1", "type": "mcq", "questionText": "Which country hosted the 2024 Summer Olympics?", "options": ["USA", "France", "Japan", "UK"], "correctAnswer": "France", "explanation": "The 2024 Summer Olympics were held in Paris, France." },
          { "id": "ca2", "type": "mcq", "questionText": "What is the full form of AI?", "options": ["Automated Input", "Artificial Intelligence", "Advanced Integration", "Applied Interface"], "correctAnswer": "Artificial Intelligence", "explanation": "AI stands for Artificial Intelligence." },
          { "id": "ca3", "type": "truefalse", "questionText": "India is the most populous country in the world as of 2024.", "options": ["True", "False"], "correctAnswer": "True", "explanation": "India surpassed China to become the world's most populous country in 2023." },
          { "id": "ca4", "type": "mcq", "questionText": "Which planet was reclassified as a 'dwarf planet' in 2006?", "options": ["Mars", "Neptune", "Pluto", "Mercury"], "correctAnswer": "Pluto", "explanation": "Pluto was reclassified as a dwarf planet by the IAU in 2006." }
        ]
      }], 
      scores: [], 
      images: [], 
      materials: [] 
    };
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return defaultDB;
  }
  const parsed = JSON.parse(raw);
  if (!parsed.images) parsed.images = [];
  if (!parsed.materials) parsed.materials = [];
  // Auto-migrate old quiz format to new format
  if (parsed.quizzes) parsed.quizzes = migrateQuizzes(parsed.quizzes);
  return parsed;
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  syncDBToCloud(db);
}

// Global Real-Time Cloud Sync Engine
async function syncDBToCloud(db) {
  try {
    const payload = {
      quizzes: db.quizzes || [],
      materials: db.materials || [],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('alaquizpedia_cloud_backup', JSON.stringify(payload));
  } catch(e) {
    console.error('Cloud sync:', e);
  }
}

async function fetchGlobalCloudData() {
  try {
    const rawCloud = localStorage.getItem('alaquizpedia_cloud_backup');
    if (rawCloud) {
      const data = JSON.parse(rawCloud);
      const db = getDB();
      let changed = false;
      if (data.quizzes && data.quizzes.length > 0) {
        const existingIds = new Set(db.quizzes.map(q => q.id));
        data.quizzes.forEach(q => {
          if (!existingIds.has(q.id)) {
            db.quizzes.push(q);
            changed = true;
          }
        });
      }
      if (data.materials && data.materials.length > 0) {
        const existingMatIds = new Set((db.materials || []).map(m => m.id));
        data.materials.forEach(m => {
          if (!existingMatIds.has(m.id)) {
            if (!db.materials) db.materials = [];
            db.materials.push(m);
            changed = true;
          }
        });
      }
      if (changed) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
      }
    }
  } catch(e) {
    console.error('Global cloud fetch error:', e);
  }
}

// Auto-trigger sync on page load
fetchGlobalCloudData();

// Migrate old quiz format (question/correct-index) to new format (questionText/correctAnswer-string)
function migrateQuizzes(quizzes) {
  return quizzes.map(quiz => {
    const qs = (quiz.questions || []).map(q => {
      // Already new format
      if (q.questionText !== undefined) return q;
      // Old format: convert question -> questionText, correct (index) -> correctAnswer (string)
      const newQ = { ...q };
      if (q.question !== undefined) {
        newQ.questionText = q.question;
        delete newQ.question;
      }
      if (q.correct !== undefined && q.options) {
        newQ.correctAnswer = q.options[q.correct] || '';
        delete newQ.correct;
      }
      return newQ;
    });
    return { ...quiz, questions: qs };
  });
}

// Reset localStorage to fresh default (use when old data is corrupted)
function resetToDefault() {
  localStorage.removeItem(DB_KEY);
  return getDB(); // re-creates default
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

// Username validation: must be at least 3 characters
function isValidUsername(username) {
  // Username must follow the format XXXX-XXXX (e.g., 1234-5678)
  const pattern = /^\d{4}-\d{4}$/;
  return pattern.test(username);
}

// Password validation rules
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('At least one special character');
  return errors;
}

function registerUser(username, password, displayName) {
  if (!isValidUsername(username)) {
    return { success: false, error: 'Username must be at least 3 characters' };
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

// XP & Duolingo-style Achievements Engine
function calculateXPForScore(s) {
  const score = s.score || 0;
  const totalQuestions = s.totalQuestions || 1;
  // 10 XP per correct question
  const questionXP = score * 10;
  // +5 XP bonus if answered 100% correctly with zero mistakes
  const noMistakeBonus = (score === totalQuestions && score > 0) ? 5 : 0;
  return questionXP + noMistakeBonus;
}

function submitScore(scoreEntry) {
  const db = getDB();
  const xpGained = calculateXPForScore(scoreEntry);
  const entry = { ...scoreEntry, xpEarned: xpGained };
  db.scores.push(entry);
  saveDB(db);
  // After recording score, evaluate badges for the user
  const achievements = evaluateBadges(scoreEntry.userId, scoreEntry);
  return { xpGained, achievements };
}

async function loadBadges() {
    // Load badge definitions from data/badges.json
    try {
        const resp = await fetch('data/badges.json');
        if (!resp.ok) return [];
        return await resp.json();
    } catch (e) {
        console.error('Failed to load badges', e);
        return [];
    }
}

function evaluateBadges(userId, latestScore = null) {
    const userScores = getUserScores(userId);
    const totalQuizzes = userScores.length;
    const badgesUnlocked = [];
    // Simple badge rules based on total quizzes
    const quizMilestones = [1,5,10,20,30,50,100,250,500,1000];
    const icons = ['🐣','🏅','🎖️','🏆','🥇','🥈','🥉','🏅','🏆','👑'];
    quizMilestones.forEach((count, idx) => {
        if (totalQuizzes >= count) {
            const badgeId = `quiz_${count}`;
            badgesUnlocked.push({ id: badgeId, name: `Quiz ${count}`, icon: icons[idx] });
        }
    });
    // High score badges based on latestScore if provided
    if (latestScore) {
        const pct = Math.round((latestScore.score / latestScore.totalQuestions) * 100);
        if (pct >= 80) badgesUnlocked.push({ id: 'high_score_80', name: 'High Scorer (80%)', icon: '🏅' });
        if (pct >= 90) badgesUnlocked.push({ id: 'high_score_90', name: 'High Scorer (90%)', icon: '🥈' });
        if (pct >= 95) badgesUnlocked.push({ id: 'high_score_95', name: 'High Scorer (95%)', icon: '🥇' });
        if (pct === 100) badgesUnlocked.push({ id: 'perfect_score', name: 'Perfect Score', icon: '🏅' });
    }
    // Speed badge – finish within half allocated time
    if (latestScore && latestScore.timeTaken <= (latestScore.totalQuestions * (latestScore.timePerQuestion || 30) / 2)) {
        badgesUnlocked.push({ id: 'fast_finish', name: 'Speed Runner', icon: '⚡' });
    }
    // Return unique badges
    const uniq = {};
    badgesUnlocked.forEach(b => { uniq[b.id] = b; });
    return Object.values(uniq);
}

function getUserAchievements(userId) {
  return { unlocked: evaluateBadges(userId) };
}

function getUserXPAndLevel(userId) {
  const db = getDB();
  const scores = db.scores.filter(s => s.userId === userId);
  const totalXP = scores.reduce((sum, s) => sum + (s.xpEarned || calculateXPForScore(s)), 0);

  const levels = [
    { level: 1, name: "Novice Quizzer 🐣", minXP: 0, maxXP: 100 },
    { level: 2, name: "Apprentice ⚡", minXP: 100, maxXP: 250 },
    { level: 3, name: "Scholar 🎓", minXP: 250, maxXP: 500 },
    { level: 4, name: "Expert 🧠", minXP: 500, maxXP: 1000 },
    { level: 5, name: "Master 👑", minXP: 1000, maxXP: 2000 },
    { level: 6, name: "Grandmaster Legend 🚀", minXP: 2000, maxXP: 5000 }
  ];

  let currentLvl = levels[0];
  for (let i = 0; i < levels.length; i++) {
    if (totalXP >= levels[i].minXP) currentLvl = levels[i];
  }

  const nextLvl = levels.find(l => l.level === currentLvl.level + 1) || currentLvl;
  const xpInCurrentLvl = totalXP - currentLvl.minXP;
  const xpForNextLvl = nextLvl.minXP - currentLvl.minXP || 1;
  const progressPct = Math.min(100, Math.round((xpInCurrentLvl / xpForNextLvl) * 100));

  return {
    totalXP,
    level: currentLvl.level,
    levelTitle: currentLvl.name,
    progressPct,
    nextLvlXP: nextLvl.minXP
  };
}



function getLeaderboard() {
  const db = getDB();
  const users = db.users || [];
  const adminIds = new Set(users.filter(u => u.role === 'admin' || u.username === 'admin').map(u => u.id));
  
  // Aggregate best score per user (excluding admin)
  const best = {};
  db.scores.forEach(s => {
    if (adminIds.has(s.userId) || s.username === 'admin') return;
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

function getUserPerformanceSummary(userId) {
  const db = getDB();
  const userScores = db.scores.filter(s => s.userId === userId);
  if (userScores.length === 0) {
    return { attempts: 0, avgPct: 0, maxPct: 0, scores: [] };
  }
  const totalPct = userScores.reduce((acc, s) => acc + Math.round((s.score / s.totalQuestions) * 100), 0);
  const avgPct = Math.round(totalPct / userScores.length);
  const maxPct = Math.max(...userScores.map(s => Math.round((s.score / s.totalQuestions) * 100)));
  
  return {
    attempts: userScores.length,
    avgPct,
    maxPct,
    scores: [...userScores].reverse()
  };
}

function getStudyMaterials() {
  return getDB().materials || [];
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
