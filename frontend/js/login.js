// ════════════════════════════════════════════════
// js/login.js  —  Login page logic
//
// WHAT THIS FILE DOES:
//   1. Toggles between Login and Register forms
//   2. Handles form submit → calls api.js functions
//   3. On success → saves token to localStorage
//      and redirects to correct page
//
// DEPENDS ON: js/api.js (must be loaded before this)
// ════════════════════════════════════════════════

// ── STATE ─────────────────────────────────────────
// Tracks whether we're in "register" or "login" mode
// false = login mode (default when page loads)
let isRegisterMode = false;

// ── TOGGLE BETWEEN LOGIN & REGISTER ───────────────
// Called when user clicks "New here? Register"
function toggleMode() {
  // Flip the mode
  isRegisterMode = !isRegisterMode;
  // ! = NOT operator. !false = true. !true = false.

  // ── Update the title ──
  document.getElementById('auth-title').textContent =
    isRegisterMode ? 'Create Account' : '✅ Todo App';
  // Ternary: condition ? valueIfTrue : valueIfFalse

  // ── Show/hide the "Name" field (only needed for register) ──
  document.getElementById('name-field').style.display =
    isRegisterMode ? 'block' : 'none';

  // ── Update the toggle link text ──
  document.getElementById('auth-switch').textContent =
    isRegisterMode ? 'Already have an account? Login' : "New here? Register";

  // ── Clear any previous error message ──
  document.getElementById('auth-msg').textContent = '';
}

// ── HANDLE FORM SUBMIT ────────────────────────────
// Called when user clicks the "Submit" button
async function handleSubmit() {
  // Get values from input fields
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value.trim();
  // .trim() = remove accidental spaces

  // Basic client-side validation
  if (!email || !password) {
    showMsg('auth-msg', 'Email and password are required.');
    return; // stop here
  }

  // ── REGISTER MODE ──────────────────────────────
  if (isRegisterMode) {
    const name = document.getElementById('auth-name').value.trim();

    if (!name) {
      showMsg('auth-msg', 'Name is required.');
      return;
    }

    // Call the register API function from api.js
    const { ok, data } = await apiRegister(name, email, password);

    if (!ok) {
      // Something went wrong (e.g. email already used)
      showMsg('auth-msg', data.error);
      return;
    }

    // Register successful!
    showMsg('auth-msg', 'Account created! Please login now.', 'success');

    // Clear the form fields
    document.getElementById('auth-name').value     = '';
    document.getElementById('auth-email').value    = '';
    document.getElementById('auth-password').value = '';

    // Switch back to login mode after 1 second
    setTimeout(() => toggleMode(), 1000);

  // ── LOGIN MODE ─────────────────────────────────
  } else {
    // Call the login API function from api.js
    const { ok, data } = await apiLogin(email, password);

    if (!ok) {
      // Wrong email or password
      showMsg('auth-msg', data.error);
      return;
    }

    // ── Login successful! ──
    // data = { token: "eyJ...", user: { id, name, email, role } }

    // Save token to localStorage (browser storage)
    // We'll read this on every API call in api.js → getHeaders()
    localStorage.setItem('token', data.token);

    // Save user info to localStorage
    // JSON.stringify() converts object to string (localStorage only stores strings)
    localStorage.setItem('user', JSON.stringify(data.user));

    // ── Redirect based on role ──
    // If admin → go to admin.html
    // If regular user → go to dashboard.html
    if (data.user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }
}
