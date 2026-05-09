// ════════════════════════════════════════════════
// js/api.js  —  SHARED UTILITY FILE
//
// WHY THIS FILE?
//   Every page (login, dashboard) needs to:
//     1. Talk to the backend (make fetch calls)
//     2. Get the JWT token from localStorage
//     3. Show toast messages
//     4. Check if user is logged in
//
//   Instead of writing the same code 2 times,
//   we write it ONCE here and load it in every HTML.
//
// LOADED BY: login.html, dashboard.html
// ════════════════════════════════════════════════

// ── BASE URL ─────────────────────────────────────
// All API calls go to this URL
// Change this ONE place if your backend port changes
const API = 'http://localhost:5000/api';

// ── GET AUTH HEADERS ─────────────────────────────
// Every protected API call needs:
//   Content-Type: application/json  → tells server we're sending JSON
//   Authorization: Bearer <token>   → proves we're logged in
const getHeaders = () => {
  // localStorage.getItem('token') = get the saved JWT token
  // We saved it in localStorage during login
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
    // Template literal: `Bearer ${token}` → "Bearer eyJhbGci..."
  };
};

// ── SHOW TOAST ────────────────────────────────────
// Shows a small popup message at bottom-right of screen
// type = 'success' (green) or 'error' (red)
const showToast = (message, type = 'success') => {
  // Get the #toast element from the HTML
  const toast = document.getElementById('toast');

  toast.textContent = message;  // set the message text

  // Change background color based on type
  toast.style.background = (type === 'error') ? '#dc2626' : '#16a34a';

  toast.style.display = 'block'; // make it visible

  // After 3 seconds (3000ms), hide the toast
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
};

// ── SHOW INLINE MESSAGE ───────────────────────────
// Shows an error/success message inside the page
// (not the popup toast, but inline text near a form)
// elementId = the id of the element to put the message in
// text = the message
// type = 'error' or 'success'
const showMsg = (elementId, text, type = 'error') => {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = (type === 'error') ? 'msg-error' : 'msg-success';
};

// ── GUARD: check if logged in ─────────────────────
// Call this at the top of dashboard.js
// If user is NOT logged in → send them to login page
const guardAuth = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    // window.location.href = navigate to a different page
    window.location.href = 'login.html';
  }
};

// ── LOGOUT ────────────────────────────────────────
// Clears everything from localStorage and goes to login
const logout = () => {
  localStorage.clear(); // removes token, user object, everything
  window.location.href = 'login.html';
};

// ════════════════════════════════════════════════
// API CALL FUNCTIONS
// These are wrapper functions around fetch().
// Each one makes ONE specific API call.
// They return the response data.
// ════════════════════════════════════════════════

// ── REGISTER ──────────────────────────────────────
// POST /api/auth/register
// Returns: { ok: true/false, data: { message } or { error } }
const apiRegister = async (name, email, password) => {
  const response = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // no token needed for register
    body: JSON.stringify({ name, email, password })
    // JSON.stringify() = convert JS object → JSON string to send in HTTP body
  });

  const data = await response.json(); // parse the JSON response
  return { ok: response.ok, data };
  // response.ok = true if status is 200–299, false if 400/500
};

// ── LOGIN ─────────────────────────────────────────
// POST /api/auth/login
// Returns: { ok, data: { token, user } }
const apiLogin = async (email, password) => {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  return { ok: response.ok, data };
};

// ── GET MY TODOS ──────────────────────────────────
// GET /api/todos?status=...&priority=...
// Both status and priority are optional
const apiGetTodos = async (status = '', priority = '') => {
  // Build the query string
  // e.g. if status='pending' and priority='high'
  // → URL becomes: /api/todos?status=pending&priority=high
  let url = `${API}/todos?`;
  if (status)   url += `status=${status}&`;
  if (priority) url += `priority=${priority}`;

  const response = await fetch(url, {
    headers: getHeaders() // need token (protected route)
  });

  return response.json(); // returns the array of todos
};

// ── CREATE TODO ───────────────────────────────────
// POST /api/todos
const apiCreateTodo = async (title, description, priority) => {
  const response = await fetch(`${API}/todos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title, description, priority })
  });

  const data = await response.json();
  return { ok: response.ok, data };
};

// ── UPDATE TODO ───────────────────────────────────
// PUT /api/todos/:id
// fields = object with only the fields to update
// e.g. { status: 'completed' } or { title: 'New title', priority: 'high' }
const apiUpdateTodo = async (id, fields) => {
  const response = await fetch(`${API}/todos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(fields)
  });

  const data = await response.json();
  return { ok: response.ok, data };
};

// ── DELETE TODO ───────────────────────────────────
// DELETE /api/todos/:id
const apiDeleteTodo = async (id) => {
  const response = await fetch(`${API}/todos/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  return { ok: response.ok };
};
