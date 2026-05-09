// ─────────────────────────────────────────────
// App.jsx — The ROOT COMPONENT
//
// This is the starting point of the React app.
// React is a JavaScript library to build UIs.
// A "component" = a reusable piece of UI (like a function that returns HTML)
//
// What this file does:
// - Checks if user is already logged in (from localStorage)
// - Shows Login page if not logged in
// - Shows Admin or Student dashboard based on role
// ─────────────────────────────────────────────

import { useState } from 'react';
// useState = a React "hook" that lets us store data inside a component
// When state changes → React automatically re-renders the UI

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // ── State: user ──
  // We try to get user from localStorage first
  // localStorage = browser storage that persists even after refresh
  // JSON.parse() = converts JSON string back to a JavaScript object
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
    // if 'user' exists in localStorage → parse and use it
    // if not → set to null (not logged in)
  );

  // State to toggle between Login and Register pages
  const [showRegister, setShowRegister] = useState(false);

  // ── Handler: after login ──
  // Called by Login.jsx when login is successful
  // userData = { id, name, email, role }
  // token = JWT token string
  const handleLogin = (userData, token) => {
    // Save to localStorage so user stays logged in on refresh
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // convert object to string to store

    setUser(userData); // update state → React re-renders and shows dashboard
  };

  // ── Handler: logout ──
  const handleLogout = () => {
    localStorage.clear();  // remove token and user from browser
    setUser(null);          // clear state → React shows Login page again
  };

  // ── What to Render ──
  // React reads this return and decides what to show on screen

  // If not logged in → show Login or Register
  if (!user) {
    if (showRegister) {
      return <Register onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
  }

  // If logged in as admin → show Admin dashboard
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Otherwise → show Student dashboard
  return <StudentDashboard user={user} onLogout={handleLogout} />;
}

export default App;
// export default = makes this component available to import in other files
