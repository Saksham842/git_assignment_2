let isRegisterMode = false;

const toggleMode = () => {
  isRegisterMode = !isRegisterMode;
  document.getElementById('auth-title').innerText = isRegisterMode ? 'Create Account' : '✅ Todo App';
  document.getElementById('name-field').style.display = isRegisterMode ? 'block' : 'none';
  document.getElementById('auth-switch').innerText = isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Register";
  document.getElementById('auth-msg').innerText = '';
};

const handleAuth = async () => {
  const name = document.getElementById('auth-name').value.trim();
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value.trim();
  const msgBox = document.getElementById('auth-msg');

  // 1. Validate inputs
  if (!email || !password || (isRegisterMode && !name)) {
    msgBox.innerText = 'Please fill in all fields';
    msgBox.className = 'msg-error';
    return;
  }

  // 2. Register Mode
  if (isRegisterMode) {
    const { ok, data } = await apiRegister(name, email, password);
    if (!ok) return (msgBox.innerText = data.error) && (msgBox.className = 'msg-error');
    
    msgBox.innerText = 'Account created! Please login now.';
    msgBox.className = 'msg-success';
    setTimeout(toggleMode, 1000);
    return;
  }

  // 3. Login Mode
  const { ok, data } = await apiLogin(email, password);
  if (!ok) return (msgBox.innerText = data.error) && (msgBox.className = 'msg-error');

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  window.location.href = 'dashboard.html';
};
