// ─────────────────────────────────────────────
// models/Application.js
// Blueprint for when a student applies to a job
// This connects students ↔ jobs
// ─────────────────────────────────────────────

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({

  jobId: {
    type: mongoose.Schema.Types.ObjectId, // stores the ID of the job
    ref: 'Job',   // points to the Job collection
    required: true
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId, // stores the ID of the student
    ref: 'User',  // points to the User collection
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'], // only these 3 values allowed
    default: 'pending' // when first applied → status is "pending"
  }

}, { timestamps: true }); // createdAt = when they applied

// ─── Prevent Duplicate Applications ───
// This line creates a "compound unique index"
// It means: one student cannot apply to the same job twice
// If they try → MongoDB will throw an error (code 11000)
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
// Creates "applications" collection in MongoDB
