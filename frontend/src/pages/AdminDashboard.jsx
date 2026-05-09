// ─────────────────────────────────────────────
// pages/AdminDashboard.jsx
//
// This page is shown to logged-in admins.
// Has three views:
//   1. "All Applications" → see all students who applied, accept/reject
//   2. "Post Job"         → form to create a new job listing
//   3. "All Jobs"         → see all posted jobs, delete them
//
// Props:
//   user     → { id, name, email, role }
//   onLogout → function to log out
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

export default function AdminDashboard({ user, onLogout }) {
  // ── State ──
  const [applications, setApplications] = useState([]); // all student applications
  const [jobs, setJobs] = useState([]);                  // all job postings
  const [view, setView] = useState('applications');      // active tab

  // State for the "Post Job" form
  // All fields in one object (common pattern)
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    description: '',
    stipend: '',
    deadline: '',
    skills: ''   // user types "Node.js, React" → we split by comma later
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Headers with JWT token (same as student dashboard)
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch everything when page loads
  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  // ── Fetch all applications ──
  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/applications/all`, { headers });
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch all jobs ──
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`, { headers });
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  // ── Update application status (accept / reject) ──
  const updateStatus = async (applicationId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/applications/${applicationId}`, {
        method: 'PUT',   // PUT = update existing resource
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setMessage(`✅ Application ${newStatus}!`);
        fetchApplications(); // refresh the list
      }
    } catch (err) {
      setMessage('❌ Failed to update status.');
    }
  };

  // ── Post a new job ──
  const handlePostJob = async (e) => {
    e.preventDefault(); // prevent page reload on form submit
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: jobForm.title,
          company: jobForm.company,
          description: jobForm.description,
          stipend: Number(jobForm.stipend), // convert string to number
          deadline: jobForm.deadline,
          // Split skills string by comma, trim whitespace from each
          // "Node.js, React, MongoDB" → ["Node.js", "React", "MongoDB"]
          skills: jobForm.skills.split(',').map(s => s.trim()).filter(s => s)
          // .filter(s => s) removes empty strings in case of trailing comma
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage('✅ Job posted successfully!');
        // Reset form back to empty
        setJobForm({ title: '', company: '', description: '', stipend: '', deadline: '', skills: '' });
        fetchJobs(); // refresh jobs list
      }
    } catch (err) {
      setMessage('❌ Cannot connect to server.');
    }
  };

  // ── Delete a job ──
  const deleteJob = async (jobId) => {
    // window.confirm() shows a browser popup "Are you sure?"
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        setMessage('✅ Job deleted.');
        fetchJobs(); // refresh
      }
    } catch (err) {
      setMessage('❌ Failed to delete job.');
    }
  };

  // ── Helper: update one field in jobForm ──
  const updateJobForm = (field, value) => {
    setJobForm({ ...jobForm, [field]: value });
  };

  // ── Status color ──
  const getStatusColor = (status) => {
    if (status === 'accepted') return 'green';
    if (status === 'rejected') return 'red';
    return '#d97706'; // orange
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  }

  return (
    <div style={styles.container}>

      {/* ── Admin Navbar ── */}
      <nav style={styles.navbar}>
        <span>🛠 Admin: <strong>{user.name}</strong></span>
        <div>
          <button
            style={{ ...styles.navBtn, background: view === 'applications' ? '#5b21b6' : '#7c3aed' }}
            onClick={() => setView('applications')}
          >
            📋 Applications ({applications.length})
          </button>
          <button
            style={{ ...styles.navBtn, background: view === 'postjob' ? '#5b21b6' : '#7c3aed' }}
            onClick={() => setView('postjob')}
          >
            ➕ Post Job
          </button>
          <button
            style={{ ...styles.navBtn, background: view === 'jobs' ? '#5b21b6' : '#7c3aed' }}
            onClick={() => setView('jobs')}
          >
            💼 All Jobs ({jobs.length})
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

      {/* ════════════════════════════════════════════
          VIEW 1: ALL APPLICATIONS
          ════════════════════════════════════════════ */}
      {view === 'applications' && (
        <div>
          <h2 style={styles.sectionTitle}>All Student Applications</h2>

          {applications.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>
              No applications yet.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* overflowX: auto → adds horizontal scroll on small screens */}
              <table>
                <thead style={{ background: '#7c3aed', color: 'white' }}>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Branch</th>
                    <th>CGPA</th>
                    <th>Job Role</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      {/* app.studentId is populated → contains { name, email, branch, cgpa } */}
                      <td><strong>{app.studentId?.name}</strong></td>
                      <td>{app.studentId?.email}</td>
                      <td>{app.studentId?.branch || 'N/A'}</td>
                      <td>{app.studentId?.cgpa || 'N/A'}</td>
                      {/* app.jobId is populated → contains { title, company } */}
                      <td>{app.jobId?.title}</td>
                      <td>{app.jobId?.company}</td>
                      <td style={{ color: getStatusColor(app.status), fontWeight: 'bold' }}>
                        {app.status.toUpperCase()}
                      </td>
                      <td>
                        {/* Only show buttons if not already accepted/rejected */}
                        {app.status === 'pending' ? (
                          <>
                            {/* <> </> = React Fragment: group elements without adding a div */}
                            <button
                              style={styles.acceptBtn}
                              onClick={() => updateStatus(app._id, 'accepted')}
                            >
                              ✓ Accept
                            </button>
                            <button
                              style={styles.rejectBtn}
                              onClick={() => updateStatus(app._id, 'rejected')}
                            >
                              ✗ Reject
                            </button>
                          </>
                        ) : (
                          <span style={{ color: '#999', fontSize: '13px' }}>Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════
          VIEW 2: POST A NEW JOB
          ════════════════════════════════════════════ */}
      {view === 'postjob' && (
        <div style={styles.formContainer}>
          <h2 style={styles.sectionTitle}>Post a New Job</h2>

          <form onSubmit={handlePostJob}>

            {/* Job Title */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Job Title *</label>
              <input
                style={styles.input}
                placeholder="e.g. SDE Intern"
                value={jobForm.title}
                onChange={(e) => updateJobForm('title', e.target.value)}
                required
              />
            </div>

            {/* Company */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Company *</label>
              <input
                style={styles.input}
                placeholder="e.g. Google"
                value={jobForm.company}
                onChange={(e) => updateJobForm('company', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Job Description *</label>
              <textarea
                style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                placeholder="Describe the role, responsibilities..."
                value={jobForm.description}
                onChange={(e) => updateJobForm('description', e.target.value)}
                required
              />
            </div>

            {/* Stipend + Deadline side by side */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Stipend (₹/month)</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="50000"
                  value={jobForm.stipend}
                  onChange={(e) => updateJobForm('stipend', e.target.value)}
                />
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Application Deadline *</label>
                <input
                  style={styles.input}
                  type="date"
                  value={jobForm.deadline}
                  onChange={(e) => updateJobForm('deadline', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Skills */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Required Skills (comma separated)</label>
              <input
                style={styles.input}
                placeholder="Node.js, React, MongoDB"
                value={jobForm.skills}
                onChange={(e) => updateJobForm('skills', e.target.value)}
              />
            </div>

            <button style={styles.submitBtn} type="submit">
              🚀 Post Job
            </button>

          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════
          VIEW 3: ALL JOBS (with delete)
          ════════════════════════════════════════════ */}
      {view === 'jobs' && (
        <div>
          <h2 style={styles.sectionTitle}>All Posted Jobs</h2>

          {jobs.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>
              No jobs posted yet. Go to "Post Job" to add one.
            </p>
          ) : (
            jobs.map((job) => (
              <div key={job._id} style={styles.jobRow}>
                <div>
                  <strong>{job.title}</strong> at <strong>{job.company}</strong>
                  <br />
                  <small style={{ color: '#666' }}>
                    ₹{job.stipend?.toLocaleString() || 'N/A'}/month |
                    Deadline: {new Date(job.deadline).toLocaleDateString('en-IN')} |
                    Skills: {job.skills?.join(', ') || 'Not specified'}
                  </small>
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteJob(job._id)}
                >
                  🗑 Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#7c3aed',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '10px'
  },
  navBtn: {
    marginLeft: '8px',
    padding: '8px 14px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  sectionTitle: {
    margin: '1rem 0',
    color: '#5b21b6'
  },
  acceptBtn: {
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '6px',
    fontSize: '13px'
  },
  rejectBtn: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  formContainer: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '600px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  formGroup: {
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
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '8px'
  },
  jobRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  deleteBtn: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap'
  }
};
