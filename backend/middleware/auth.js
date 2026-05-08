// ════════════════════════════════════════════════
// middleware/auth.js
//
// WHAT IS MIDDLEWARE?
//   Middleware = a function that runs BETWEEN
//   the request arriving and the route running.
//
//   Request → [middleware] → Route Handler → Response
//
//   Think of it as a SECURITY GUARD at the door.
//   Before you enter the route, the guard checks
//   your ID (JWT token). If OK → let in. If not → block.
//
// HOW IT'S USED IN ROUTES:
//   router.get('/todos', verifyToken, handler)
//                        ^^^^^^^^^^^
//                        runs first, then handler
// ════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
// jsonwebtoken = library to create and verify JWT tokens

// ────────────────────────────────────────────────
// MIDDLEWARE 1: verifyToken
// Checks if the request has a valid JWT token.
// Used on ALL protected routes.
// ────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  // Every API request from frontend includes a header like:
  //   Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5..."
  //                           ^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                           this is the token

  // req.headers['authorization'] = full string "Bearer <token>"
  // ?.split(' ') = split by space → ["Bearer", "<token>"]
  // [1]          = take the second item → just the token
  // ?. is "optional chaining" → won't crash if header is missing
  const token = req.headers['authorization']?.split(' ')[1];

  // If no token found in the request, block immediately
  if (!token) {
    // 401 = Unauthorized (you need to login first)
    return res.status(401).json({ error: 'No token. Please login first.' });
  }

  try {
    // jwt.verify(token, secretKey) does two things:
    //   1. Checks the token hasn't been tampered with
    //   2. Checks it hasn't expired
    // If both pass → returns the DECODED data inside the token
    // The data we stored when creating the token: { id, role }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to the request object
    // So any route after this middleware can do: req.user.id, req.user.role
    req.user = decoded;
    // decoded looks like: { id: "abc123", role: "user", iat: 1234, exp: 5678 }
    // iat = issued at (when token was created)
    // exp = expiry time

    // next() = "I'm done, go to the next step (the actual route)"
    next();

  } catch (err) {
    // If token is expired OR was tampered with → jwt.verify throws an error
    return res.status(401).json({ error: 'Invalid or expired token. Login again.' });
  }
};

// ────────────────────────────────────────────────
// MIDDLEWARE 2: adminOnly
// Runs AFTER verifyToken.
// Checks if the logged-in user is an admin.
// ────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  // req.user was set by verifyToken above
  if (req.user.role !== 'admin') {
    // 403 = Forbidden (you're logged in but not allowed)
    return res.status(403).json({ error: 'Admins only. Access denied.' });
  }
  next(); // user is admin, allow through
};

// Export both so routes can use them
module.exports = { verifyToken, adminOnly };
