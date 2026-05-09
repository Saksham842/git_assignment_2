# ✅ Todo App — Complete Beginner's Study Guide

> Read this README top to bottom before touching any code.
> This tells you the WHY behind every file.

---

## 🗂 Folder Structure (What Each File Does)

```
todo-app/
│
├── backend/                  ← Node.js server (runs on port 5000)
│   ├── index.js              ← ENTRY POINT. Connects MongoDB, registers routes, starts server
│   ├── .env                  ← Secrets (MongoDB URL, JWT key). Never push to GitHub.
│   │
│   ├── models/               ← Database blueprints (what data looks like)
│   │   ├── User.js           ← User: name, email, password (hashed), role
│   │   └── Todo.js           ← Todo: title, description, status, priority, userId
│   │
│   ├── routes/               ← API endpoints (what URLs do what)
│   │   ├── auth.js           ← POST /api/auth/register + POST /api/auth/login
│   │   └── todos.js          ← GET/POST/PUT/DELETE /api/todos + GET /api/todos/all
│   │
│   └── middleware/
│       └── auth.js           ← verifyToken (security guard for routes)
│
└── frontend/                 ← Plain HTML/CSS/JS (no framework needed)
    ├── login.html            ← Login + Register page
    ├── dashboard.html        ← User todo management page
    │
    ├── css/
    │   ├── global.css        ← Shared: reset, buttons, inputs, nav, badges, toast, modal
    │   ├── login.css         ← Centering the auth card
    │   ├── dashboard.css     ← Stats, add form, filters, todo cards
    │   └── admin.css         ← Stats, table styles
    │
    └── js/
        ├── api.js            ← SHARED: all fetch() calls + auth helpers + toast
        ├── login.js          ← Toggle login/register + handle submit
        ├── dashboard.js      ← Load/add/edit/delete/filter todos + render
```

---

## 🔄 Complete App Flow (Step by Step)

```
STEP 1: User opens login.html in browser
   ↓
STEP 2: User fills email + password → clicks Submit
   ↓
STEP 3: login.js calls apiLogin() from api.js
   ↓
STEP 4: fetch() sends POST to http://localhost:5000/api/auth/login
   ↓
STEP 5: Backend routes/auth.js handles it:
         - Find user by email
         - Compare password with stored hash (bcrypt)
         - If match → create JWT token (jsonwebtoken)
         - Send back: { token, user: { id, name, email } }
   ↓
STEP 6: login.js receives token → saves to localStorage
   ↓
STEP 7: login.js redirects to dashboard.html
   ↓
STEP 8: dashboard.js loads
         - window.onload calls guardAuth() → check token exists
         - calls loadTodos() → fetch('/api/todos') with token in header
         - Backend verifyToken middleware checks token → allows if valid
         - Returns this user's todos → renderStats() + renderTodos()
   ↓
STEP 9: Logout
         - logout() in api.js → localStorage.clear() → back to login.html
```

---

## 🔑 The 5 Core Concepts (Memorise These)

### 1. JWT (JSON Web Token) — The Stamp

```
Login → Server creates a STAMP (token) containing { id }
User saves stamp in localStorage
Every API call sends: Authorization: Bearer <stamp>
Server reads stamp → knows WHO is making the request
```

### 2. Password Hashing — Never Store Plain Text

```javascript
// STORING password (during register):
const hash = await bcrypt.hash("mypassword123", 10);
// "mypassword123" → "$2a$10$Xpabcdef..." (unreadable)
// Store the hash in MongoDB

// CHECKING password (during login):
const match = await bcrypt.compare("mypassword123", storedHash);
// → true or false
```

### 3. Middleware — The Security Guard

```javascript
// Routes use middleware like this:
router.get('/todos', verifyToken, handler)
//                   ^^^^^^^^^^^
//                   runs BEFORE handler
//                   blocks if no valid token
```

### 4. Mongoose .populate() — Fill in Related Data

```javascript
// Without populate — just stores an ID:
{ userId: "507f1f77bcf86cd799439011", title: "Do dishes" }

// With .populate('userId', 'name email') — fills in actual data:
{ userId: { name: "Anurag", email: "a@a.com" }, title: "Do dishes" }
```

### 5. How Frontend Talks to Backend (fetch)

```javascript
// Every protected API call must send the token:
fetch('http://localhost:5000/api/todos', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

---

## 🌐 All API Endpoints (Reference Card)

| Method | URL | Auth | What it does |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | None | Create new user |
| POST | `/api/auth/login` | None | Login, get token |
| GET | `/api/todos` | User | Get MY todos |
| GET | `/api/todos?status=pending` | User | Filter by status |
| GET | `/api/todos?priority=high` | User | Filter by priority |
| POST | `/api/todos` | User | Create new todo |
| PUT | `/api/todos/:id` | User (owner) | Update a todo |
| DELETE | `/api/todos/:id` | User | Delete a todo |

---

## 🚀 How to Run (3 Steps)

### Step 1 — Start MongoDB
Make sure MongoDB is running on your machine.
Open MongoDB Compass or run `mongod` in a terminal.

### Step 2 — Start Backend
```bash
cd todo-app/backend
node index.js

# You should see:
# 🚀 Server running on http://localhost:5000
# ✅ MongoDB connected successfully!
```

### Step 3 — Open Frontend
Open `todo-app/frontend/login.html` with **Live Server** in VS Code.
(Right-click the file → "Open with Live Server")

OR just double-click `login.html` to open in browser.

---



## 📁 Which CSS File Does What

| File | Loaded by | Styles |
|------|-----------|--------|
| `global.css` | All HTML files | All styles for the application |

---

## 📁 Which JS File Does What

| File | Loaded by | Responsibility |
|------|-----------|---------------|
| `api.js` | All HTML files | All fetch() calls, getHeaders(), showToast(), guardAuth(), logout() |
| `login.js` | login.html only | Toggle mode, handle register/login form |
| `dashboard.js` | dashboard.html only | Load/render todos, add, edit, delete, filter, stats |

---

## ⚡ Pattern to Remember for Any New Project

```
1. Create models/   → what the data looks like (Schema)
2. Create routes/   → what URLs do what (CRUD)
3. Create middleware/ → who can access what (auth guards)
4. Wire it all in index.js
5. Frontend: api.js (all fetch calls) + page-specific JS
```

This pattern works for ANY project:
- Placement Portal → User + Job + Application models
- Todo App         → User + Todo models
- E-commerce       → User + Product + Order models
- Blog             → User + Post + Comment models

The skeleton is always the same. Only the models and routes change.
