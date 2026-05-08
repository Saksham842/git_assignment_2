// ════════════════════════════════════════════════
// index.js  —  THE MAIN SERVER FILE
//
// This is the ENTRY POINT of the backend.
// When you run: node index.js
//   → This file runs first
//   → Connects to MongoDB
//   → Sets up all routes
//   → Starts listening for requests
//
// Think of this as the "manager" file that
// imports everything and plugs it all together.
// ════════════════════════════════════════════════

const express  = require('express');
// express = framework to build APIs. Makes routing easy.

const mongoose = require('mongoose');
// mongoose = lets us connect to and work with MongoDB

const cors     = require('cors');
// cors = Cross-Origin Resource Sharing
// PROBLEM: Browser blocks requests from one origin (localhost:5500)
//          to another origin (localhost:5000) by default.
// SOLUTION: cors() tells the browser "it's fine, allow this"

require('dotenv').config();
// dotenv reads our .env file and loads the values into process.env
// After this line: process.env.MONGO_URI, process.env.JWT_SECRET work

// ── Create the Express Application ──
const app = express();
// app is our server object. We configure it and start it below.

// ════════════════════════════════════════════════
// MIDDLEWARE — runs on EVERY request before routes
// ════════════════════════════════════════════════

app.use(cors());
// Allow all cross-origin requests (fine for development)
// In production you'd restrict this to specific domains

app.use(express.json());
// Parse JSON from request bodies
// Without this: req.body is undefined even if frontend sends JSON
// With this:    req.body = { email: "a@a.com", password: "123" }

// ════════════════════════════════════════════════
// CONNECT TO MONGODB
// ════════════════════════════════════════════════

mongoose.connect(process.env.MONGO_URI)
  // process.env.MONGO_URI reads the value from .env file
  // "mongodb://localhost:27017/tododb"

  .then(() => {
    // .then() = runs if connection SUCCEEDS
    console.log('✅ MongoDB connected successfully!');
  })

  .catch((err) => {
    // .catch() = runs if connection FAILS
    // Common reasons: MongoDB service not running, wrong URL
    console.log('❌ MongoDB connection failed:', err.message);
  });

// ════════════════════════════════════════════════
// REGISTER ROUTES
// Tell Express: "use this router for this URL prefix"
// ════════════════════════════════════════════════

app.use('/api/auth', require('./routes/auth'));
// Any request starting with /api/auth goes to routes/auth.js
// Examples:
//   POST /api/auth/register → handled in routes/auth.js
//   POST /api/auth/login    → handled in routes/auth.js

app.use('/api/todos', require('./routes/todos'));
// Any request starting with /api/todos goes to routes/todos.js
// Examples:
//   GET    /api/todos        → get user's todos
//   POST   /api/todos        → create todo
//   PUT    /api/todos/:id    → update todo
//   DELETE /api/todos/:id    → delete todo
//   GET    /api/todos/all    → admin: get all todos

// ════════════════════════════════════════════════
// START THE SERVER
// ════════════════════════════════════════════════

const PORT = 5000;
// PORT = which "door" to listen on
// Like a room number in a building (your computer)
// Frontend will send requests to: http://localhost:5000

app.listen(PORT, () => {
  // app.listen() = start the server and wait for incoming requests
  // The callback runs once the server is ready
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
