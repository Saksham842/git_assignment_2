// ─────────────────────────────────────────────
// routes/applications.js
// Handles student applications to jobs
//
// POST /api/applications        → student applies to a job
// GET  /api/applications/my     → student sees their own applications
// GET  /api/applications/all    → admin sees ALL applications
// PUT  /api/applications/:id    → admin accepts/rejects an application
// ─────────────────────────────────────────────

const router = require('express').Router();
const Application = require('../models/Application');
const { verifyToken, adminOnly } = require('../middleware/auth');

// ─────────────────────────────────────────────
// ROUTE 1: POST /api/applications
// Student applies to a job
// ─────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  const { jobId } = req.body; // frontend sends the job's ID

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required.' });
  }

  try {
    // Create a new application document in MongoDB
    const application = await Application.create({
      jobId,
      studentId: req.user.id // req.user.id = logged-in student's ID (set by verifyToken)
    });

    res.status(201).json(application);

  } catch (err) {
    // err.code 11000 = MongoDB duplicate key error
    // This happens when the same student applies to the same job twice
    // (because of the unique index we set in Application.js model)
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You have already applied to this job.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE 2: GET /api/applications/my
// Student views ONLY their own applications
// ─────────────────────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
  try {
    // Find all applications where studentId matches logged-in user
    const applications = await Application.find({ studentId: req.user.id })
      // .populate() = "fill in the job details instead of just storing job ID"
      // Without populate: { jobId: "abc123", status: "pending" }
      // With populate:    { jobId: { title: "SDE", company: "Google", ... }, status: "pending" }
      // 'title company stipend deadline' = only get these specific fields from Job
      .populate('jobId', 'title company stipend deadline');

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE 3: GET /api/applications/all
// Admin views ALL applications from all students
// ─────────────────────────────────────────────
router.get('/all', verifyToken, adminOnly, async (req, res) => {
  try {
    // Application.find() with no filter = get everything
    const applications = await Application.find()
      // Populate student info (name, email, branch, cgpa)
      .populate('studentId', 'name email branch cgpa')
      // Populate job info (title, company)
      .populate('jobId', 'title company');

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE 4: PUT /api/applications/:id
// Admin updates application status (accept/reject)
// PUT = update an existing document
// ─────────────────────────────────────────────
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  const { status } = req.body; // "accepted", "rejected", or "pending"

  // Make sure the status value is valid
  if (!['accepted', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Status must be accepted, rejected, or pending.' });
  }

  try {
    // findByIdAndUpdate(id, dataToUpdate, options)
    // { new: true } = return the updated document (not the old one)
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
