// ─────────────────────────────────────────────
// models/Job.js
// Blueprint for a Job listing posted by admin
// ─────────────────────────────────────────────

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true  // e.g. "SDE Intern"
  },

  company: {
    type: String,
    required: true  // e.g. "Google"
  },

  description: {
    type: String,
    required: true  // details about the role
  },

  skills: [String], // Array of strings e.g. ["Node.js", "React"]
                    // [String] = "this field holds a list of text values"

  stipend: { type: Number }, // monthly pay in ₹

  deadline: {
    type: Date,    // date format e.g. 2025-06-30
    required: true
  },

  postedBy: {
    type: mongoose.Schema.Types.ObjectId, // this stores the ID of the admin who posted it
    ref: 'User'  // "ref" = this ID points to the User collection
                 // This is how we connect two collections together (like a foreign key in SQL)
  }

}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
// This creates a collection called "jobs" in MongoDB
