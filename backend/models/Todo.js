// ════════════════════════════════════════════════
// models/Todo.js
//
// Blueprint for a single Todo item.
// Every todo belongs to a user (via userId).
//
// A todo has:
//   - title       → what the task is
//   - description → optional extra details
//   - status      → where it is in the workflow
//   - priority    → how urgent it is
//   - userId      → which user created it
// ════════════════════════════════════════════════

const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    // Title of the todo — required
    title: {
      type: String,
      required: true,  // cannot create a todo without a title
      trim: true       // remove extra spaces
    },

    // Optional description/notes
    description: {
      type: String,
      default: ''      // if not provided, store empty string (not null)
    },

    // Status: tracks progress of the todo
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      // Only these 3 values allowed. Any other value → MongoDB error.
      default: 'pending'
      // New todos always start as 'pending'
    },

    // Priority: how urgent/important the task is
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },

    // userId: which user this todo belongs to
    // This is the KEY that links todos → users
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      // ObjectId = MongoDB's unique ID format (e.g. "507f1f77bcf86cd799439011")
      // We store the User's _id here
      ref: 'User',
      // ref = 'User' means: "this ID points to the User collection"
      // This allows .populate('userId') to fill in user details
      required: true
      // Every todo MUST belong to a user
    }
  },

  { timestamps: true }
  // auto-adds createdAt and updatedAt
);

// Export the model
// MongoDB will create a "todos" collection
module.exports = mongoose.model('Todo', todoSchema);
