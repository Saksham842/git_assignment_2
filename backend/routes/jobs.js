// ─────────────────────────────────────────────
// routes/jobs.js
// Handles all job-related API endpoints
//
// GET  /api/jobs       → get all jobs (any logged in user)
// POST /api/jobs       → post a new job (admin only)
// DELETE /api/jobs/:id → delete a job (admin only)
// ─────────────────────────────────────────────

const router = require('express').Router();
const Job = require('../models/Job');

// Import our middleware functions
// verifyToken = check if user is logged in
// adminOnly = check if user is admin
const { verifyToken, adminOnly } = require('../middleware/auth');

// ─────────────────────────────────────────────
// ROUTE 1: GET /api/jobs
// Returns list of all job postings
// Any logged-in user (student or admin) can see this
// ─────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  // verifyToken runs first (security check), then this function runs
  try {
    // Job.find() = get ALL documents from the "jobs" collection
    // .sort({ createdAt: -1 }) = newest jobs first (-1 = descending)
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs); // send array of jobs as JSON response
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE 2: POST /api/jobs
// Admin posts a new job
// Uses TWO middlewares: verifyToken AND adminOnly
// Both must pass before the route runs
// ─────────────────────────────────────────────
router.post('/', verifyToken, adminOnly, async (req, res) => {
  // verifyToken runs → adminOnly runs → then this function runs
  const { title, company, description, skills, stipend, deadline } = req.body;

  // Validate required fields
  if (!title || !company || !description || !deadline) {
    return res.status(400).json({ error: 'Title, company, description, and deadline are required.' });
  }

  try {
    const job = await Job.create({
      title,
      company,
      description,
      skills: skills || [],  // if skills not provided, use empty array
      stipend,
      deadline,
      postedBy: req.user.id  // req.user.id was set by verifyToken middleware
                             // this saves which admin posted the job
    });

    res.status(201).json(job); // return the created job
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE 3: DELETE /api/jobs/:id
// Admin deletes a job
// :id = a dynamic part of the URL
// e.g. DELETE /api/jobs/abc123 → req.params.id = "abc123"
// ─────────────────────────────────────────────
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    // req.params.id = the job ID from the URL
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
