// ─────────────────────────────────────────────
// middleware/auth.js
//
// What is Middleware?
// Middleware = a function that runs BETWEEN the request arriving
// and the route handler running.
//
// Example flow:
//   Browser sends request → [auth middleware checks token] → route runs
//
// Think of it like a security guard at a club entrance.
// The guard checks your ID before letting you in.
// ─────────────────────────────────────────────

const jwt = require('jsonwebtoken'); // jsonwebtoken helps us create & verify tokens

// ─── Middleware 1: verifyToken ───
// This checks if the user is logged in
// Every protected route will use this first
const verifyToken = (req, res, next) => {
  // req.headers['authorization'] looks like: "Bearer eyJhbGci..."
  // .split(' ')[1] grabs just the token part after "Bearer "
  const token = req.headers['authorization']?.split(' ')[1];

  // If no token found, block the request
  if (!token) {
    return res.status(401).json({ error: 'No token provided. Please login first.' });
    // 401 = "Unauthorized" — you need to be logged in
  }

  try {
    // jwt.verify() decodes the token and checks if it's valid
    // If token was tampered with or expired → this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded will look like: { id: "abc123", role: "student", iat: ..., exp: ... }
    req.user = decoded; // attach user info to the request so routes can use it

    next(); // "next()" = go to the next step (the actual route handler)
  } catch (err) {
    // Token is invalid or expired
    return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
};

// ─── Middleware 2: adminOnly ───
// This runs AFTER verifyToken
// It checks if the logged-in user is an admin
const adminOnly = (req, res, next) => {
  // req.user was set by verifyToken above
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
    // 403 = "Forbidden" — you're logged in but not allowed
  }
  next(); // user is admin, let them through
};

// Export both functions so routes can use them
module.exports = { verifyToken, adminOnly };
