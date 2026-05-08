// ════════════════════════════════════════════════
// js/dashboard.js  —  User dashboard logic
//
// WHAT THIS FILE DOES:
//   1. On page load: check login, show username, load todos
//   2. Render stats (total/pending/in-progress/completed)
//   3. Render todo cards
//   4. Add new todo
//   5. Mark todo as done
//   6. Delete todo
//   7. Open edit modal → save edit
//   8. Filter todos by status/priority
//
// DEPENDS ON: js/api.js (loaded before this in HTML)
// ════════════════════════════════════════════════

// ── MODULE-LEVEL VARIABLES ─────────────────────
// These are like "global state" for this page

let allTodos = [];
// Stores the current list of todos fetched from server
// We store them here so we don't need to re-fetch on every render

let currentFilter = { status: '', priority: '' };
// Tracks which filters are active
// e.g. { status: 'pending', priority: 'high' }
// Empty string '' = no filter applied

let editingTodoId = null;
// When user opens the edit modal, we store the ID here
// So when they click "Save", we know which todo to update

// ════════════════════════════════════════════════
// STEP 1: PAGE LOAD
// window.onload runs automatically when HTML is fully loaded
// ════════════════════════════════════════════════
window.onload = () => {
  // ── Security check ──
  // If not logged in → redirect to login.html immediately
  guardAuth(); // defined in api.js

  // ── Show welcome message ──
  // Get the user object we saved in localStorage during login
  const user = JSON.parse(localStorage.getItem('user'));
  // JSON.parse() = convert stored JSON string back to object

  document.getElementById('welcome-msg').textContent = `👋 ${user.name}`;
  // template literal: `👋 ${user.name}` = "👋 Anurag"

  // ── Load todos from server ──
  loadTodos();
};

// ════════════════════════════════════════════════
// STEP 2: LOAD TODOS
// Fetches ALL todos from server so stats are accurate
// ════════════════════════════════════════════════
async function loadTodos() {
  // Fetch ALL todos (no filters passed to backend)
  allTodos = await apiGetTodos('', '');

  // Refresh both the stats and the todo list on screen
  renderStats();
  renderTodos();
}

// ════════════════════════════════════════════════
// STEP 3: RENDER STATS
// Shows 4 count boxes at the top of the page
// ════════════════════════════════════════════════
function renderStats() {
  // .filter() = returns a new array with only items matching the condition
  const total      = allTodos.length;
  const pending    = allTodos.filter(t => t.status === 'pending').length;
  const inProgress = allTodos.filter(t => t.status === 'in-progress').length;
  const completed  = allTodos.filter(t => t.status === 'completed').length;

  // Update the number shown in each stat box
  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-pending').textContent  = pending;
  document.getElementById('stat-progress').textContent = inProgress;
  document.getElementById('stat-done').textContent     = completed;
}

// ════════════════════════════════════════════════
// STEP 4: RENDER TODOS
// Builds HTML for each todo and puts it on the page
// Filters the list locally based on currentFilter
// ════════════════════════════════════════════════
function renderTodos() {
  const listDiv = document.getElementById('todo-list');

  // ── 1. Apply active filters ──
  let filteredTodos = allTodos;
  if (currentFilter.status) {
    filteredTodos = filteredTodos.filter(t => t.status === currentFilter.status);
  }
  if (currentFilter.priority) {
    filteredTodos = filteredTodos.filter(t => t.priority === currentFilter.priority);
  }

  // If no todos match, show a friendly empty message
  if (filteredTodos.length === 0) {
    listDiv.innerHTML = '<div class="empty">No todos found matching your filters.</div>';
    return; // stop here
  }

  // .map() = loop over array and return HTML string for each item
  // .join('') = merge all strings into one big HTML string
  listDiv.innerHTML = filteredTodos.map(todo => {
    // Decide which badge class to use for status
    // 'in-progress' has a dash which doesn't work as CSS class → use 'inprogress'
    const statusClass = todo.status === 'in-progress' ? 'inprogress' : todo.status;

    // Build the "Done" button — only if todo is not already completed
    const doneBtn = todo.status !== 'completed'
      ? `<button class="btn-green btn-sm" onclick="markDone('${todo._id}')">✓ Done</button>`
      : ''; // empty string = no button

    // Build description line — only if description exists
    const descLine = todo.description
      ? `<div class="todo-desc">${todo.description}</div>`
      : '';

    // Return the full card HTML as a string
    // Template literals (backticks) let us write multi-line strings
    return `
      <div class="todo-card ${todo.priority} ${todo.status === 'completed' ? 'completed' : ''}">
        
        <div class="todo-info">
          <div class="todo-title">${todo.title}</div>
          ${descLine}
          <div class="todo-badges">
            <span class="badge badge-${statusClass}">${todo.status}</span>
            <span class="badge badge-${todo.priority}">${todo.priority}</span>
          </div>
        </div>

        <div class="todo-actions">
          ${doneBtn}
          <button class="btn-orange btn-sm" onclick="openEditModal('${todo._id}')">Edit</button>
          <button class="btn-red btn-sm"    onclick="deleteTodo('${todo._id}')">Delete</button>
        </div>

      </div>
    `;
  }).join(''); // join array of strings into one string
}

// ════════════════════════════════════════════════
// ADD TODO
// Called when user clicks "Add Todo" button
// ════════════════════════════════════════════════
async function addTodo() {
  const title       = document.getElementById('new-title').value.trim();
  const description = document.getElementById('new-desc').value.trim();
  const priority    = document.getElementById('new-priority').value;

  if (!title) {
    showToast('Please enter a title!', 'error');
    return;
  }

  const { ok, data } = await apiCreateTodo(title, description, priority);

  if (!ok) {
    showToast(data.error, 'error');
    return;
  }

  // Clear the form
  document.getElementById('new-title').value    = '';
  document.getElementById('new-desc').value     = '';
  document.getElementById('new-priority').value = 'medium'; // reset to default

  showToast('Todo added! ✅');
  loadTodos(); // refresh list
}

// ════════════════════════════════════════════════
// MARK AS DONE
// Quickly sets status to 'completed'
// ════════════════════════════════════════════════
async function markDone(id) {
  // Only update the status field
  const { ok, data } = await apiUpdateTodo(id, { status: 'completed' });

  if (!ok) {
    showToast(data.error, 'error');
    return;
  }

  showToast('Marked as completed! 🎉');
  loadTodos();
}

// ════════════════════════════════════════════════
// DELETE TODO
// ════════════════════════════════════════════════
async function deleteTodo(id) {
  // window.confirm() shows a browser popup "Are you sure?"
  // Returns true if user clicks OK, false if Cancel
  if (!window.confirm('Delete this todo? This cannot be undone.')) {
    return; // user cancelled
  }

  const { ok } = await apiDeleteTodo(id);

  if (!ok) {
    showToast('Failed to delete. Try again.', 'error');
    return;
  }

  showToast('Deleted!');
  loadTodos();
}

// ════════════════════════════════════════════════
// EDIT MODAL
// ════════════════════════════════════════════════

// ── Open edit modal ──
// Called when user clicks "Edit" on a todo card
function openEditModal(id) {
  // Find the todo in our allTodos array
  // .find() = returns the FIRST item matching the condition
  const todo = allTodos.find(t => t._id === id);
  if (!todo) return; // shouldn't happen, but just in case

  // Remember which todo we're editing
  editingTodoId = id;

  // Fill the modal form with current values
  document.getElementById('edit-title').value    = todo.title;
  document.getElementById('edit-desc').value     = todo.description || '';
  document.getElementById('edit-status').value   = todo.status;
  document.getElementById('edit-priority').value = todo.priority;

  // Show the modal by adding the "open" class
  // In CSS: .modal-overlay.open { display: flex; }
  document.getElementById('edit-modal').classList.add('open');
}

// ── Close edit modal ──
function closeEditModal() {
  editingTodoId = null; // clear the editing state
  document.getElementById('edit-modal').classList.remove('open');
  // Removing 'open' class → CSS hides the modal again
}

// ── Save edited todo ──
// Called when user clicks "Save" in the modal
async function saveEdit() {
  const title       = document.getElementById('edit-title').value.trim();
  const description = document.getElementById('edit-desc').value.trim();
  const status      = document.getElementById('edit-status').value;
  const priority    = document.getElementById('edit-priority').value;

  if (!title) {
    showToast('Title cannot be empty!', 'error');
    return;
  }

  const { ok, data } = await apiUpdateTodo(editingTodoId, {
    title,
    description,
    status,
    priority
  });

  if (!ok) {
    showToast(data.error, 'error');
    return;
  }

  showToast('Todo updated! ✏️');
  closeEditModal();
  loadTodos();
}

// ════════════════════════════════════════════════
// FILTER TODOS
// Called when user clicks a filter button
// type  = 'status' or 'priority'
// value = e.g. 'pending', 'high'
// btn   = the button element that was clicked
// ════════════════════════════════════════════════
function setFilter(type, value, btn) {
  // Toggle: if same filter clicked again → clear it
  if (currentFilter[type] === value) {
    currentFilter[type] = ''; // clear this filter
  } else {
    currentFilter[type] = value; // set new filter
  }

  // ── Update button styles ──
  // Remove 'active' class from all buttons of this type
  // querySelectorAll returns a NodeList (like an array) of matching elements
  document.querySelectorAll(`.filter-${type}`).forEach(b => {
    b.classList.remove('active');
  });

  // Add 'active' to the clicked button (if filter was set, not cleared)
  if (currentFilter[type]) {
    btn.classList.add('active');
  }

  // Just re-render the list locally (don't fetch from server again)
  renderTodos();
}
