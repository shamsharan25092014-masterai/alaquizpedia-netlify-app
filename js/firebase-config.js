// Firebase configuration for ALA QUIZPEDIA
const firebaseConfig = {
  apiKey: "AIzaSyDou77RyldEovEE0wQgazSXyGqEaCEJ_Rg",
  authDomain: "ala-quizpedia-2026.firebaseapp.com",
  projectId: "ala-quizpedia-2026",
  storageBucket: "ala-quizpedia-2026.firebasestorage.app",
  messagingSenderId: "332882186662",
  appId: "1:332882186662:web:842e565f30cb541e917f67",
  measurementId: "G-14LY3DZ1JK"
};

// Initialize Firebase for compat SDK (standard script tag usage)
if (typeof firebase !== 'undefined' && firebase.apps) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}

if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}
