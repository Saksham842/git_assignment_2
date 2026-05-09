// ─────────────────────────────────────────────
// pages/Login.jsx
//
// This is the Login page component.
// It shows a form and sends data to backend.
//
// Props received from App.jsx:
//   onLogin(userData, token) → called after successful login
//   onSwitchToRegister      → called when user clicks "Register" link
// ─────────────────────────────────────────────

import { useState } from 'react';

// API_URL = base URL of our backend
// Instead of typing http://localhost:5000 everywhere, we define it once here
const API_URL = 'http://localhost:5000';

export default function Login({ onLogin, onSwitchToRegister }) {
  // ── State: form fields ──
  // We track what user types in the inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ── State: error message ──
  // If something goes wrong, we show an error
  const [error, setError] = useState('');

  // ── State: loading ──
  // While waiting for server response, disable the button
  const [loading, setLoading] = useState(false);

  // ── Handler: form submit ──
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent default browser form submit (page reload)
    setError('');        // clear any previous error
    setLoading(true);    // show loading state

    try {
      // fetch() = built-in browser function to make HTTP requests
      // It's like sending a letter to the server and waiting for a reply
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',                             // POST = sending data
        headers: { 'Content-Type': 'application/json' }, // tell server we're sending JSON
        body: JSON.stringify({ email, password })   // convert JS object → JSON string
      });

      // response.json() = read and parse the JSON reply from server
      const data = await response.json();

      if (!response.ok) {
        // response.ok = true if status is 200-299, false if 400/500
        setError(data.error); // show error message from server
      } else {
        // Login successful!
        // data = { token: "eyJ...", user: { id, name, email, role } }
        onLogin(data.user, data.token); // tell App.jsx that login worked
      }

    } catch (err) {
      // This catches network errors (e.g. server not running)
      setError('Cannot connect to server. Is the backend running?');
    }

    setLoading(false); // re-enable button
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h2 style={styles.title}>🎓 Placement Portal</h2>
        <p style={styles.subtitle}>Login to your account</p>

        {/* Show error if any */}
        {error && <p className="error-msg">{error}</p>}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@college.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // onChange fires every time user types a character
              // e.target.value = what is currently typed in the box
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {/* Switch to Register */}
        <p style={styles.switchText}>
          Don't have an account?{' '}
          <span style={styles.link} onClick={onSwitchToRegister}>
            Register here
          </span>
        </p>

        {/* Hint for testing */}
        <div style={styles.hint}>
          <small>
            <strong>Admin login:</strong> Create a user in MongoDB and set role: "admin"<br />
            <strong>Student login:</strong> Register a new account below
          </small>
        </div>

      </div>
    </div>
  );
}

// ── Inline styles (CSS written as JS objects) ──
// In React, style is an object: {{ property: 'value' }}
// CSS: background-color: red → JS: backgroundColor: 'red'
const styles = {
  page: {
    display: 'flex',          // flexbox = easy centering
    justifyContent: 'center', // center horizontally
    alignItems: 'center',     // center vertically
    minHeight: '100vh',       // take full screen height
    background: '#f0f2f5'
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '380px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)'  // soft shadow
  },
  title: {
    textAlign: 'center',
    marginBottom: '4px',
    color: '#1e3a8a'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '1.5rem',
    fontSize: '14px'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',    // label on its own line
    marginBottom: '4px',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    marginTop: '8px'
  },
  switchText: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '14px'
  },
  link: {
    color: '#1e3a8a',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  hint: {
    marginTop: '1rem',
    background: '#f8f9fa',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#555'
  }
};
