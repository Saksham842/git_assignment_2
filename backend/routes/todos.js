// ════════════════════════════════════════════════
// routes/todos.js
//
// All todo-related API endpoints live here.
//
// ENDPOINTS:
//   GET    /api/todos        → get logged-in user's todos (with filters)
//   POST   /api/todos        → create a new todo
//   PUT    /api/todos/:id    → update a todo (title, status, priority...)
//   DELETE /api/todos/:id    → delete a todo
//
// KEY PATTERN: every route uses verifyToken middleware
//   → means you must be logged in to use any of these
// ════════════════════════════════════════════════

const router = require('express').Router();
const Todo = require('../models/Todo');

// Import middleware
const { verifyToken } = require('../middleware/auth');



// ────────────────────────────────────────────────
// ROUTE 1: GET /api/todos
// Returns only the logged-in user's todos
// Supports optional filters via query params:
//   /api/todos?status=pending
//   /api/todos?priority=high
//   /api/todos?status=pending&priority=high
// ────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    // Start with a filter that only finds THIS user's todos
    // req.user.id = set by verifyToken middleware (from the JWT token)
    const filter = { userId: req.user.id };

    // req.query = the ?key=value part of the URL
    // e.g. /api/todos?status=pending → req.query = { status: 'pending' }
    // If status was passed in the URL, add it to the filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Same for priority
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Now find todos matching all filter conditions
    const todos = await Todo.find(filter).sort({ createdAt: -1 });

    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────
// ROUTE 2: POST /api/todos
// Create a new todo for the logged-in user
//
// Request body (what frontend sends):
//   { title: "Read chapter 5", description: "Math book", priority: "high" }
// ────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  // Pull out the values from request body
  const { title, description, priority } = req.body;

  // Title is required — validate first
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  try {
    // Create and save new todo to MongoDB
    const todo = await Todo.create({
      title,
      description,    // optional — defaults to '' if not provided (from schema)
      priority,       // optional — defaults to 'medium' if not provided (from schema)
      userId: req.user.id  // attach the logged-in user's ID
                           // req.user was set by verifyToken
    });

    // 201 = Created
    res.status(201).json(todo);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────
// ROUTE 3: PUT /api/todos/:id
// Update a specific todo
// :id = dynamic URL segment (e.g. /api/todos/abc123)
// req.params.id = "abc123"
//
// Request body can have any of:
//   { title, description, status, priority }
// ────────────────────────────────────────────────
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Find the todo that:
    //   1. has this specific _id (from URL)
    //   2. belongs to the logged-in user (security!)
    // The userId check prevents User A from editing User B's todos
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    // If no todo found → either wrong ID, or it's another user's todo
    if (!todo) {
      // 404 = Not Found
      return res.status(404).json({ error: 'Todo not found or not yours to edit.' });
    }

    // ── Update only the fields that were provided ──
    // We don't force user to send all fields, only what changed

    const { title, description, status, priority } = req.body;

    // Only update if the value was provided (not undefined)
    if (title)                    todo.title       = title;
    if (description !== undefined) todo.description = description;
    // description can be empty string "" which is falsy, so we check !== undefined
    if (status)                   todo.status      = status;
    if (priority)                 todo.priority    = priority;

    // todo.save() = save the changes back to MongoDB
    // This also updates the 'updatedAt' timestamp automatically
    await todo.save();

    res.json(todo); // send back the updated todo

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────
// ROUTE 4: DELETE /api/todos/:id
// Delete a specific todo (only if it belongs to logged-in user)
// ────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // findOneAndDelete = find the document AND delete it in one step
    // We add userId check here too (security — can't delete someone else's todo)
    const deletedTodo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    // If nothing was deleted, the todo either doesn't exist or isn't theirs
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found or not yours to delete.' });
    }

    res.json({ message: 'Todo deleted successfully.' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
