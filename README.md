# 🎓 Student Placement Portal — Beginner's Guide

## What is this project?
A full-stack web app where:
- **Students** can register, browse jobs, apply, and check their status
- **Admin** (placement cell) can post jobs, view all applications, accept/reject them

---

## 🧱 Tech Stack (What Tools We Used)

| Tool | Purpose |
|------|---------|
| **Node.js** | Runs JavaScript on the server (backend) |
| **Express** | Framework to build APIs (routes) easily |
| **MongoDB** | NoSQL database to store users, jobs, applications |
| **Mongoose** | Makes talking to MongoDB easier from Node.js |
| **bcryptjs** | Hashes (scrambles) passwords before saving |
| **jsonwebtoken** | Creates JWT tokens for authentication |
| **React** | JavaScript library to build UIs (frontend) |
| **Vite** | Tool that runs React app in development |

---

## 📁 Folder Structure Explained

```
placement-portal/
│
├── backend/               ← Node.js + Express server
│   ├── index.js           ← Main server file (starts everything)
│   ├── .env               ← Secret config (MongoDB URL, JWT secret)
│   ├── models/            ← Database blueprints (what data looks like)
│   │   ├── User.js        ← User schema (name, email, password, role...)
│   │   ├── Job.js         ← Job schema (title, company, skills...)
│   │   └── Application.js ← Application schema (who applied to what)
│   ├── routes/            ← API endpoints (what URLs do what)
│   │   ├── auth.js        ← /register and /login
│   │   ├── jobs.js        ← get/post/delete jobs
│   │   └── applications.js← apply, view, accept/reject
│   └── middleware/
│       └── auth.js        ← JWT token verification (security guard)
│
└── frontend/              ← React app
    └── src/
        ├── main.jsx       ← Entry point (React starts here)
        ├── App.jsx        ← Root component (decides which page to show)
        ├── index.css      ← Global styles
        └── pages/
            ├── Login.jsx          ← Login form
            ├── Register.jsx       ← Registration form
            ├── StudentDashboard.jsx ← Browse jobs + my applications
            └── AdminDashboard.jsx   ← Post jobs + manage applications
```

---

## 🚀 How to Run

### Step 1: Make sure MongoDB is running
- If using local MongoDB: start MongoDB service
- If using MongoDB Atlas: update MONGO_URI in `backend/.env`

### Step 2: Start the Backend
```bash
cd placement-portal/backend
node index.js
# Should print: 🚀 Server is running on http://localhost:5000
# Should print: ✅ MongoDB connected successfully
```

### Step 3: Start the Frontend (in a new terminal)
```bash
cd placement-portal/frontend
npm run dev
# Should print: ➜ Local: http://localhost:5173/
```

### Step 4: Open browser
Go to: **http://localhost:5173**

---

## 👤 How to Create an Admin Account

Since registration only creates students, to get an admin:

1. Open **MongoDB Compass** (or use MongoDB shell)
2. Go to `placementdb` database → `users` collection
3. Find your registered user
4. Change `role: "student"` → `role: "admin"`
5. Save → Login with that email/password → You'll see Admin Dashboard!

---

## 🔄 How the App Flow Works

```
1. Open http://localhost:5173
2. You see Login page (not logged in)
3. Click "Register here" → fill form → account created
4. Login → gets JWT token from server → saved in localStorage
5. Token checked: if role=student → StudentDashboard
                  if role=admin  → AdminDashboard
6. Every API call sends token in header: "Authorization: Bearer <token>"
7. Backend middleware verifies token → allows or blocks
8. Logout → localStorage cleared → back to Login
```

---

## 🔑 Key Concepts to Remember

### 1. JWT (JSON Web Token)
- After login, server creates a "stamp" (token)
- Token contains: user ID + role
- Every future request carries this token
- Server reads it to know WHO is making the request

### 2. Password Hashing
- NEVER store plain passwords
- bcrypt.hash("password123") → "$2a$10$Xp..." (unreadable)
- bcrypt.compare() checks if input matches the hash

### 3. Middleware
- Functions that run BEFORE your route handler
- `verifyToken` = checks if token is valid (security guard)
- `adminOnly` = checks if role is "admin"
- If middleware fails → route never runs

### 4. Mongoose .populate()
- Instead of storing just an ID, fill in the full data
- `app.jobId` (ID only) → `app.jobId.title, app.jobId.company` (full object)

### 5. React useState
- Stores data that can change (forms, API responses)
- When state changes → React re-renders the UI automatically

### 6. React useEffect
- Runs code when component first appears (like page load)
- We use it to fetch data from the API on page load

---

## 🌐 API Endpoints Reference

| Method | URL | Who | What it does |
|--------|-----|-----|-------------|
| POST | /api/auth/register | Anyone | Create student account |
| POST | /api/auth/login | Anyone | Login, get JWT token |
| GET | /api/jobs | Logged in | Get all jobs |
| POST | /api/jobs | Admin only | Post new job |
| DELETE | /api/jobs/:id | Admin only | Delete a job |
| POST | /api/applications | Student | Apply to a job |
| GET | /api/applications/my | Student | See own applications |
| GET | /api/applications/all | Admin | See all applications |
| PUT | /api/applications/:id | Admin | Accept/reject application |
