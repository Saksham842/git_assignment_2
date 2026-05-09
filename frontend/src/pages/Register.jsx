// ─────────────────────────────────────────────
// pages/Register.jsx
//
// Registration page for new students.
// Sends data to POST /api/auth/register
//
// Props:
//   onSwitchToLogin → called after successful register (go to login)
// ─────────────────────────────────────────────

import { useState } from 'react';

const API_URL = 'http://localhost:5000';

export default function Register({ onSwitchToLogin }) {
  // All form fields tracked in a single state object
  // This is a common pattern: one object for all form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    cgpa: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Handler: update form field ──
  // Instead of separate setName, setEmail etc.,
  // we use one function with the field name
  const handleChange = (field, value) => {
    // Spread operator (...) = copy all existing fields, then update one
    // Example: { ...form, name: 'Anurag' }
    setForm({ ...form, [field]: value });
    // [field] = computed property name (e.g. if field="name" → { name: value })
  };

  // ── Handler: form submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          branch: form.branch,
          cgpa: parseFloat(form.cgpa) // convert string "8.5" → number 8.5
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
      } else {
        // Registration worked!
        setSuccess('Account created! Redirecting to login...');
        // Wait 1.5 seconds then switch to login page
        setTimeout(() => onSwitchToLogin(), 1500);
      }

    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h2 style={styles.title}>📝 Create Account</h2>
        <p style={styles.subtitle}>Register as a student</p>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <form onSubmit={handleSubmit}>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              style={styles.input}
              placeholder="Anurag Sharma"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>College Email *</label>
            <input
              style={styles.input}
              type="email"
              placeholder="anurag@iiitm.ac.in"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password * (min 6 chars)</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1, marginRight: '8px' }}>
              <label style={styles.label}>Branch</label>
              <input
                style={styles.input}
                placeholder="CSE"
                value={form.branch}
                onChange={(e) => handleChange('branch', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>CGPA</label>
              <input
                style={styles.input}
                type="number"
                placeholder="8.5"
                step="0.01"
                min="0"
                max="10"
                value={form.cgpa}
                onChange={(e) => handleChange('cgpa', e.target.value)}
              />
            </div>
          </div>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>

        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <span style={styles.link} onClick={onSwitchToLogin}>
            Login here
          </span>
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f0f2f5'
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '420px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
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
  row: {
    display: 'flex',
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
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
  }
};
