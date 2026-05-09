// ─────────────────────────────────────────────
// pages/StudentDashboard.jsx
//
// This page is shown to logged-in students.
// Has two views:
//   1. "Browse Jobs" → see all jobs, apply to them
//   2. "My Applications" → see your application status
//
// Props:
//   user     → { id, name, email, role }
//   onLogout → function to log out
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';
// useEffect = runs a function when the component first appears on screen
// (or when certain values change)
// We use it here to fetch jobs and applications when the page loads

const API_URL = 'http://localhost:5000';

export default function StudentDashboard({ user, onLogout }) {
  // ── State ──
  const [jobs, setJobs] = useState([]);          // list of all job postings
  const [myApps, setMyApps] = useState([]);      // student's own applications
  const [view, setView] = useState('jobs');       // which tab is active: 'jobs' or 'applications'
  const [message, setMessage] = useState('');    // success/error message after applying
  const [loading, setLoading] = useState(true);  // show loading while fetching

  // ── Get the token from localStorage ──
  // We need to send this with every API request to prove we're logged in
  const token = localStorage.getItem('token');

  // ── Helper: common headers for API calls ──
  // Every protected API call needs:
  //   Content-Type: application/json → we're sending JSON
  //   Authorization: Bearer <token>  → prove we're logged in
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
    // Template literal: `Bearer ${token}` = "Bearer " + token value
  };

  // ── useEffect: runs when component first renders ──
  // The empty array [] at the end means "only run once on mount"
  // "mount" = when the component first appears on screen
  useEffect(() => {
    fetchJobs();
    fetchMyApps();
  }, []); // [] = dependency array. Empty = run once on mount only.

  // ── Fetch all jobs ──
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`, { headers });
      const data = await res.json();
      setJobs(data); // update state → React re-renders with new data
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false); // stop loading spinner regardless of success/failure
    }
  };

  // ── Fetch student's own applications ──
  const fetchMyApps = async () => {
    try {
      const res = await fetch(`${API_URL}/api/applications/my`, { headers });
      const data = await res.json();
      setMyApps(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  // ── Apply to a job ──
  const applyToJob = async (jobId) => {
    setMessage(''); // clear previous message
    try {
      const res = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jobId }) // send the job's ID to backend
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error}`); // e.g. "Already applied"
      } else {
        setMessage('✅ Applied successfully!');
        fetchMyApps(); // refresh applications list to update "Applied ✓" buttons
      }
    } catch (err) {
      setMessage('❌ Something went wrong.');
    }
  };

  // ── Check if already applied ──
  // Returns true if student already applied to this jobId
  const alreadyApplied = (jobId) => {
    // .some() = returns true if ANY element in the array matches the condition
    return myApps.some((app) => app.jobId?._id === jobId);
    // app.jobId?._id → optional chaining (?.) = safe access, won't crash if jobId is null
  };

  // ── Get status color ──
  const getStatusColor = (status) => {
    if (status === 'accepted') return 'green';
    if (status === 'rejected') return 'red';
    return '#d97706'; // orange for pending
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  }

  return (
    <div style={styles.container}>

      {/* ── Navigation Bar ── */}
      <nav style={styles.navbar}>
        <span>👋 Hello, <strong>{user.name}</strong> | Branch: {user.branch || 'N/A'}</span>
        <div>
          {/* Clicking a tab button changes the 'view' state */}
          <button
            style={{ ...styles.navBtn, background: view === 'jobs' ? '#1e40af' : '#3b5bdb' }}
            onClick={() => setView('jobs')}
          >
            📋 Browse Jobs
          </button>
          <button
            style={{ ...styles.navBtn, background: view === 'applications' ? '#1e40af' : '#3b5bdb' }}
            onClick={() => setView('applications')}
          >
            📁 My Applications ({myApps.length})
          </button>
          <button style={{ ...styles.navBtn, background: '#dc2626' }} onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── Message Banner ── */}
      {message && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          background: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
          color: message.startsWith('✅') ? 'green' : 'red',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      {/* ── View 1: Browse Jobs ── */}
      {/* Conditional rendering: only show if view === 'jobs' */}
      {view === 'jobs' && (
        <div>
          <h2 style={styles.sectionTitle}>Available Jobs ({jobs.length})</h2>

          {jobs.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>
              No jobs posted yet. Check back later!
            </p>
          )}

          {/* Render a card for each job */}
          <div style={styles.grid}>
            {jobs.map((job) => (
              // .map() = loops over array and returns JSX for each item
              // key={job._id} = React needs a unique key for each item in a list
              <div key={job._id} style={styles.card}>
                <h3 style={styles.jobTitle}>{job.title}</h3>
                <p style={styles.company}>🏢 {job.company}</p>
                <p style={styles.desc}>{job.description}</p>

                <div style={styles.details}>
                  <span>💰 ₹{job.stipend?.toLocaleString() || 'N/A'}/month</span>
                  <span>📅 {new Date(job.deadline).toLocaleDateString('en-IN')}</span>
                  {/* new Date(isoString) → converts "2025-06-30T..." to Date object */}
                  {/* .toLocaleDateString('en-IN') → formats as "30/6/2025" */}
                </div>

                {job.skills?.length > 0 && (
                  <div style={styles.skills}>
                    {job.skills.map((skill, index) => (
                      <span key={index} style={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                )}

                <button
                  style={{
                    ...styles.applyBtn,
                    background: alreadyApplied(job._id) ? '#6b7280' : '#1e3a8a',
                    cursor: alreadyApplied(job._id) ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => applyToJob(job._id)}
                  disabled={alreadyApplied(job._id)} // disabled = cannot click
                >
                  {alreadyApplied(job._id) ? '✓ Applied' : 'Apply Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── View 2: My Applications ── */}
      {view === 'applications' && (
        <div>
          <h2 style={styles.sectionTitle}>My Applications</h2>

          {myApps.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>
              You haven't applied to any jobs yet. Browse jobs to apply!
            </p>
          ) : (
            <table>
              <thead style={{ background: '#1e3a8a', color: 'white' }}>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Stipend</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myApps.map((app) => (
                  <tr key={app._id}>
                    {/* app.jobId is populated — it contains the full job object */}
                    <td><strong>{app.jobId?.company}</strong></td>
                    <td>{app.jobId?.title}</td>
                    <td>₹{app.jobId?.stipend?.toLocaleString() || 'N/A'}</td>
                    <td>{app.jobId?.deadline ? new Date(app.jobId.deadline).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td>
                      <span style={{
                        color: getStatusColor(app.status),
                        fontWeight: 'bold'
                      }}>
                        {app.status.toUpperCase()}
                        {/* .toUpperCase() → "pending" → "PENDING" */}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',      // center the page
    padding: '1rem'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#1e3a8a',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    flexWrap: 'wrap',       // wraps on smaller screens
    gap: '10px'
  },
  navBtn: {
    marginLeft: '8px',
    padding: '8px 14px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px'
  },
  sectionTitle: {
    margin: '1rem 0',
    color: '#1e3a8a'
  },
  grid: {
    display: 'grid',
    // auto-fill = as many columns as fit | minmax(280px, 1fr) = each min 280px wide
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem'
  },
  card: {
    background: 'white',
    padding: '1.2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  jobTitle: {
    color: '#1e3a8a',
    marginBottom: '4px'
  },
  company: {
    color: '#444',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  desc: {
    fontSize: '13px',
    color: '#555',
    marginBottom: '10px',
    lineHeight: '1.5'
  },
  details: {
    display: 'flex',
    gap: '12px',
    fontSize: '13px',
    color: '#444',
    marginBottom: '10px',
    flexWrap: 'wrap'
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '12px'
  },
  skillTag: {
    background: '#e0e7ff',
    color: '#3730a3',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  applyBtn: {
    width: '100%',
    padding: '10px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};
