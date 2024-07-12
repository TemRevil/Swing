// Login/Logou Event
const modal = document.querySelector('.modal.logout-modal');

document.getElementById('logout-modal').addEventListener('click', () => {
  modal.classList.remove('off');
});

document.getElementById('logout-yes').addEventListener('click', () => {
  window.location.href = 'Login.html';
});

document.getElementById('logout-no').addEventListener('click', () => {
  modal.classList.add('off');
});

// Add event listener to close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target === modal || e.target.classList.contains('logout-modal')) {
    modal.classList.add('off');
  }
});
// -----------------------------------------
