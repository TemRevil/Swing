const form = document.getElementById('login-form');
const alertElement = document.getElementById('alert');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const handleInput = () => alertElement.textContent = '';

usernameInput.addEventListener('input', handleInput);
passwordInput.addEventListener('input', handleInput);

// Get stored username from local storage
const storedUsername = localStorage.getItem('username');
if (storedUsername) {
  usernameInput.value = storedUsername;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value;
  const password = passwordInput.value;
  if (username === 'temrevil' && password === '123') {
    alertElement.textContent = `Hello, ${username}!`;
    setTimeout(() => window.location.href = 'Swing.html', 1000);
    // Store username in local storage
    localStorage.setItem('username', username);
  } else {
    alertElement.textContent = 'Invalid username or password';
    setTimeout(() => alertElement.textContent = '', 2000);
  }
});