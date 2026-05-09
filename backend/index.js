// ─────────────────────────────────────────────
// index.js — The MAIN SERVER FILE
//
// This is where everything comes together.
// Think of this as the "brain" of the backend.
//
// What happens when you run "node index.js":
// 1. Connect to MongoDB
// 2. Start listening for requests on port 5000
// ─────────────────────────────────────────────

const express = require('express');   // express = framework to build APIs
const mongoose = require('mongoose'); // mongoose = tool to connect and work with MongoDB
const cors = require('cors');         // cors = allows frontend (different port) to talk to backend
require('dotenv').config();           // loads .env file so we can use process.env.MONGO_URI etc.

const app = express(); // create an express application

// ─── Middleware Setup ───
// These run on EVERY request before any route

app.use(cors());
// cors() = Cross-Origin Resource Sharing
// Without this: frontend on localhost:5173 CANNOT talk to backend on localhost:5000
// With this: all origins allowed (fine for development)

app.use(express.json());
// express.json() = allows our server to read JSON from request body
// Without this: req.body would be undefined

// ─── Connect to MongoDB ───
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // .then() = runs when connection is successful
  })
  .catch((err) => {
    console.log('❌ MongoDB connection failed:', err);
    // .catch() = runs when connection fails
  });

// ─── Routes Setup ───
// Tell Express: "if URL starts with /api/auth, use the auth router"
// require('./routes/auth') = import the router from that file

app.use('/api/auth', require('./routes/auth'));
// handles: POST /api/auth/register, POST /api/auth/login

app.use('/api/jobs', require('./routes/jobs'));
// handles: GET /api/jobs, POST /api/jobs, DELETE /api/jobs/:id

app.use('/api/applications', require('./routes/applications'));
// handles: POST /api/applications, GET /api/applications/my, etc.

// ─── Start the Server ───
const PORT = 5000; // port number — like a door number on your computer
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
