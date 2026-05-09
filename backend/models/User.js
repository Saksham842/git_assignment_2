// ════════════════════════════════════════════════
// models/User.js
//
// WHAT IS A MODEL?
//   A model = a blueprint that tells MongoDB
//   exactly what fields a document should have.
//   Think of it like a form template.
//
// WHAT IS A SCHEMA?
//   Schema = the structure/rules of the blueprint.
//   e.g. "name must be a String and is required"
// ════════════════════════════════════════════════

const mongoose = require('mongoose');
// mongoose = the library that connects Node.js to MongoDB

// ── Define the Schema (blueprint) ──
const userSchema = new mongoose.Schema(
  {
    // name field: must be text, cannot be empty
    name: {
      type: String,      // must be a string (text)
      required: true,    // this field MUST be provided
      trim: true         // removes spaces from beginning and end
                         // e.g. "  Anurag  " → "Anurag"
    },

    // email field: must be unique across all users
    email: {
      type: String,
      required: true,
      unique: true,      // no two users can have the same email
      lowercase: true    // always saves in lowercase
                         // e.g. "Anurag@Gmail.COM" → "anurag@gmail.com"
    },

    // password field: we store the HASHED version, never plain text
    password: {
      type: String,
      required: true
    }
  },

  // Second argument to Schema: options
  { timestamps: true }
  // timestamps: true → MongoDB auto-adds:
  //   createdAt: when the document was created
  //   updatedAt: when it was last changed
);

// ── Create the Model from the Schema ──
// mongoose.model('User', userSchema)
//   'User'      = name of the model (singular, capital)
//   userSchema  = the blueprint we defined above
// MongoDB will create a collection called "users" (plural, lowercase)
module.exports = mongoose.model('User', userSchema);
// module.exports = makes this available when other files do require('./models/User')
