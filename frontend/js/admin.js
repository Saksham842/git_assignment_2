// ════════════════════════════════════════════════
// js/admin.js  —  Admin panel logic
//
// WHAT THIS FILE DOES:
//   1. Check user is admin (redirect if not)
//   2. Load ALL todos from ALL users
//   3. Show summary stats
//   4. Render a table with every todo
//
// This page is READ-ONLY for the admin.
// Admin can see everything but can't add/delete.
//
// DEPENDS ON: js/api.js (loaded before this in HTML)
// ════════════════════════════════════════════════

// ════════════════════════════════════════════════
// PAGE LOAD
// ════════════════════════════════════════════════
window.onload = () => {
  // ── Security: must be admin ──
  // guardAdmin() is defined in api.js
  // If user is not admin → redirects to login.html
  guardAdmin();

  // ── Load all todos ──
  loadAllTodos();
};

// ════════════════════════════════════════════════
// LOAD ALL TODOS
// Fetches every todo (from every user) from server
// ════════════════════════════════════════════════
async function loadAllTodos() {
  // apiGetAllTodos() is defined in api.js
  // Calls GET /api/todos/all (admin-only endpoint)
  // Returns todos with userId POPULATED (has name + email of each user)
  const todos = await apiGetAllTodos();

  // Render stats and table
  renderAdminStats(todos);
  renderAdminTable(todos);
}

// ════════════════════════════════════════════════
// RENDER STATS
// Shows 3 summary boxes at the top
// ════════════════════════════════════════════════
function renderAdminStats(todos) {
  // todos is an array of all todos across all users

  const total     = todos.length;
  const completed = todos.filter(t => t.status === 'completed').length;
  const pending   = todos.filter(t => t.status === 'pending').length;
  // .filter() = returns new array where condition is true
  // .length   = count of that filtered array

  // Put numbers into the HTML elements
  document.getElementById('stat-total').textContent     = total;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-pending').textContent   = pending;
}

// ════════════════════════════════════════════════
// RENDER ADMIN TABLE
// Builds an HTML table showing all todos
// ════════════════════════════════════════════════
function renderAdminTable(todos) {
  // Get the <tbody> element where rows will go
  const tbody = document.getElementById('admin-tbody');

  // Handle empty case
  if (todos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:#888; padding:2rem;">
          No todos found across any user.
        </td>
      </tr>
    `;
    return;
  }

  // Build a table row for each todo
  // todo.userId is POPULATED (from .populate() in the backend)
  // so we can access todo.userId.name and todo.userId.email
  tbody.innerHTML = todos.map(todo => {
    // Determine status badge class
    // CSS class can't have a dash, so 'in-progress' → 'inprogress'
    const statusClass = todo.status === 'in-progress' ? 'inprogress' : todo.status;

    // Format the date nicely
    // new Date(isoString) = converts "2025-05-08T..." to a Date object
    // .toLocaleDateString() = formats as "8/5/2025" (depends on locale)
    const date = new Date(todo.createdAt).toLocaleDateString();

    return `
      <tr>
        <td>${todo.userId?.name  || 'Unknown'}</td>
        <td>${todo.userId?.email || 'Unknown'}</td>
        <td>${todo.title}</td>
        <td><span class="badge badge-${todo.priority}">${todo.priority}</span></td>
        <td><span class="badge badge-${statusClass}">${todo.status}</span></td>
        <td>${date}</td>
      </tr>
    `;
    // todo.userId?.name = optional chaining
    // ?. means: "if todo.userId exists, get .name; otherwise return undefined"
    // || 'Unknown' = fallback if name is undefined
  }).join('');
  // .join('') = merge array of row strings into one big HTML string
}
