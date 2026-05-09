// ─────────────────────────────────────────────
// models/User.js
// A "model" is just a blueprint for how data
// looks in our MongoDB database.
// Think of it like designing an Excel column header.
// ─────────────────────────────────────────────

const mongoose = require('mongoose'); // mongoose helps us talk to MongoDB

// This is our "User blueprint" (schema)
// Every user stored in MongoDB will have exactly these fields
const userSchema = new mongoose.Schema({

  name: {
    type: String,        // must be text
    required: true,      // cannot be empty - user must give name
    trim: true           // removes extra spaces from both ends
  },

  email: {
    type: String,
    required: true,
    unique: true,        // no two users can have same email
    lowercase: true      // always saves email in lowercase
  },

  password: {
    type: String,
    required: true       // we'll save a hashed (scrambled) version of password
  },

  role: {
    type: String,
    enum: ['student', 'admin'],  // role can ONLY be these two values
    default: 'student'           // if not specified, user is a student
  },

  branch: { type: String },  // e.g. "CSE", "ECE" — optional field

  cgpa: {
    type: Number,
    min: 0,   // cgpa cannot be below 0
    max: 10   // cgpa cannot be above 10
  },

  resumeLink: { type: String }  // student can paste their Google Drive resume link

}, { timestamps: true }); // timestamps: true → auto adds createdAt and updatedAt fields

// Export this model so other files can use it
module.exports = mongoose.model('User', userSchema);
// This creates a collection called "users" in MongoDB
