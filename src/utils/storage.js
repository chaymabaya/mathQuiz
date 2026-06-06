import defaultQuestions from '../data/defaultQuestions';

const RESULTS_KEY   = 'mathquiz_results';
const QUESTIONS_KEY = 'mathquiz_questions';
const ADMIN_SESSION = 'mathquiz_admin';

// ── Questions ──────────────────────────────────────────────
export function getQuestions() {
  try {
    const s = localStorage.getItem(QUESTIONS_KEY);
    return s ? JSON.parse(s) : defaultQuestions;
  } catch {
    return defaultQuestions;
  }
}

export function saveQuestions(questions) {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

// ── Results ────────────────────────────────────────────────
export function getResults() {
  try {
    const s = localStorage.getItem(RESULTS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function addResult(result) {
  const results = getResults();
  results.unshift({ ...result, id: Date.now(), date: new Date().toISOString() });
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

export function clearResults() {
  localStorage.removeItem(RESULTS_KEY);
}

// ── Admin auth ─────────────────────────────────────────────
export function adminLogin(username, password) {
  if (username === 'admin' && password === 'admin1234') {
    sessionStorage.setItem(ADMIN_SESSION, 'true');
    return true;
  }
  return false;
}

export function adminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION);
}

export function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION) === 'true';
}
