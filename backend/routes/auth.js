// ─────────────────────────────────────────────
// routes/auth.js
//
// What is a Route?
// A route = an address + what to do when someone visits it
// Example: POST /api/auth/register → run register logic
//
// What is a Router?
// Instead of defining all routes in index.js,
// we split them into separate files (like this one) for organization.
// ─────────────────────────────────────────────

const router = require('express').Router(); // Router = mini-app to define routes
const bcrypt = require('bcryptjs');         // bcryptjs = tool to hash (scramble) passwords
const jwt = require('jsonwebtoken');         // jsonwebtoken = creates a token after login
const User = require('../models/User');      // our User blueprint from models/User.js

// ─────────────────────────────────────────────
// ROUTE 1: POST /api/auth/register
// Purpose: Create a new student account
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  // req.body = whatever JSON the frontend sent
  // e.g. { name: "Anurag", email: "a@a.com", password: "123456", branch: "CSE", cgpa: 8.5 }
  const { name, email, password, branch, cgpa } = req.body;

  // ── Step 1: Basic Validation ──
  // Check all required fields are present
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
    // 400 = "Bad Request" — the data you sent is incomplete
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // ── Step 2: Check if email already exists ──
    const existingUser = await User.findOne({ email }); // look for user with this email
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    // ── Step 3: Hash the password ──
    // NEVER store plain text passwords in database!
    // bcrypt.hash("mypassword", 10) → scrambles it into something like "$2a$10$Xp..."
    // The 10 = how many times to scramble (more = safer but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Step 4: Save user to database ──
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // store the scrambled version
      branch,
      cgpa
      // role defaults to "student" as defined in the schema
    });

    // ── Step 5: Send success response ──
    res.status(201).json({ message: 'Account created successfully! Please login.' });
    // 201 = "Created" — something new was created

  } catch (err) {
    // If anything goes wrong, send error message
    res.status(500).json({ error: err.message });
    // 500 = "Internal Server Error" — something broke on our end
  }
});

// ─────────────────────────────────────────────
// ROUTE 2: POST /api/auth/login
// Purpose: Login and get a JWT token
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // ── Step 1: Validate inputs ──
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // ── Step 2: Find user by email ──
    const user = await User.findOne({ email });
    if (!user) {
      // Don't say "email not found" — say "invalid credentials" for security
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // ── Step 3: Compare password ──
    // bcrypt.compare() hashes the input and compares with stored hash
    // It returns true if they match, false if not
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // ── Step 4: Create a JWT Token ──
    // JWT = JSON Web Token
    // It's like a stamp you get after logging in
    // Every future request must carry this stamp
    // The stamp contains: user's ID and role
    const token = jwt.sign(
      { id: user._id, role: user.role },  // data to store inside the token
      process.env.JWT_SECRET,             // secret key to sign/verify the token
      { expiresIn: '1d' }                 // token expires in 1 day
    );

    // ── Step 5: Send token + user info back to frontend ──
    res.json({
      token, // frontend will save this in localStorage
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role  // frontend uses role to show student or admin dashboard
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // export so index.js can use it
