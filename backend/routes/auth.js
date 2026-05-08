// ════════════════════════════════════════════════
// routes/auth.js
//
// WHAT IS A ROUTE?
//   A route = a URL + what to do when that URL is hit.
//   Example:
//     POST /api/auth/register → create a new user
//     POST /api/auth/login    → check password, give token
//
// WHAT IS A ROUTER?
//   Instead of putting all routes in index.js,
//   we split them into separate files by topic.
//   This file handles everything auth-related.
// ════════════════════════════════════════════════

const router = require('express').Router();
// Router = a mini express app just for defining routes
// We'll attach this to the main app in index.js

const bcrypt = require('bcryptjs');
// bcryptjs = library to hash (scramble) passwords
// Rule: NEVER store plain text passwords

const jwt = require('jsonwebtoken');
// jsonwebtoken = create tokens after login

const User = require('../models/User');
// Import our User model/blueprint
// '../' = go one folder up (from routes/ to backend/)

// ════════════════════════════════════════════════
// ROUTE 1: POST /api/auth/register
//
// What it does: Creates a new user account
//
// Request body (what frontend sends):
//   { name: "Anurag", email: "a@a.com", password: "123456" }
//
// Response (what we send back):
//   { message: "Registered successfully" }
// ════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  // async = this function uses await (waits for async operations)

  // req.body = the JSON data sent from the frontend
  // We destructure (unpack) the values we need
  const { name, email, password } = req.body;

  // ── STEP 1: Validate inputs ──
  // Check required fields exist
  if (!name || !email || !password) {
    // 400 = Bad Request (client sent bad/incomplete data)
    return res.status(400).json({ error: 'Name, email and password are all required.' });
    // return = stop here, don't run the rest of the function
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // ── STEP 2: Check if email already used ──
    // User.findOne({ email }) = search users collection for a document with this email
    // Returns the found user OR null if not found
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered. Try logging in.' });
    }

    // ── STEP 3: Hash the password ──
    // bcrypt.hash(plainPassword, saltRounds)
    // saltRounds = 10 → how many times to scramble (more = safer but slower)
    // "password123" → "$2a$10$abcXYZ..." (unreadable hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── STEP 4: Save new user to MongoDB ──
    // User.create({...}) = inserts a new document into the "users" collection
    await User.create({
      name,
      email,
      password: hashedPassword, // store the HASH, never the plain password
      // role defaults to 'user' as set in the schema
    });

    // ── STEP 5: Send success response ──
    // 201 = Created (a new resource was created successfully)
    res.status(201).json({ message: 'Account created! Please login.' });

  } catch (err) {
    // Something unexpected went wrong (e.g. MongoDB is down)
    // 500 = Internal Server Error (our fault, not the client's)
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════
// ROUTE 2: POST /api/auth/login
//
// What it does: Verifies credentials and returns a JWT token
//
// Request body:
//   { email: "a@a.com", password: "123456" }
//
// Response:
//   { token: "eyJ...", user: { id, name, email, role } }
// ════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // ── STEP 1: Validate inputs ──
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // ── STEP 2: Find the user by email ──
    const user = await User.findOne({ email });

    // Security tip: Don't say "email not found" — just say "invalid credentials"
    // This prevents attackers from knowing which emails are registered
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // ── STEP 3: Compare the entered password with the stored hash ──
    // bcrypt.compare(plainText, hashedText) → returns true or false
    // It hashes the plainText with the same salt and compares
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // ── STEP 4: Create a JWT Token ──
    // jwt.sign(payload, secretKey, options)
    //   payload   = data to store INSIDE the token (visible after decoding)
    //   secretKey = used to sign; anyone with this key can verify the token
    //   options   = { expiresIn: '1d' } = token expires after 1 day
    const token = jwt.sign(
      { id: user._id, role: user.role },
      // _id = MongoDB auto-generated unique ID for this user
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ── STEP 5: Send token back to frontend ──
    // Frontend will save this token in localStorage
    // and send it with every future request
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role    // frontend uses role to redirect to admin.html or dashboard.html
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export the router so index.js can use it
module.exports = router;
