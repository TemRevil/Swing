// Logout Event
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
// Menu Kinds Slider
const menuKinds = document.querySelector('.menu-kinds');
let isDown = false;
let startX;
let scrollLeft;

menuKinds.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX;
  scrollLeft = menuKinds.scrollLeft;
});

menuKinds.addEventListener('touchstart', (e) => {
  isDown = true;
  startX = e.touches[0].pageX;
  scrollLeft = menuKinds.scrollLeft;
});

menuKinds.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  const x = e.pageX;
  const walk = x - startX;
  menuKinds.scrollLeft = scrollLeft - walk;
});

menuKinds.addEventListener('touchmove', (e) => {
  if (!isDown) return;
  const x = e.touches[0].pageX;
  const walk = x - startX;
  menuKinds.scrollLeft = scrollLeft - walk;
});

menuKinds.addEventListener('mouseup', () => {
  isDown = false;
});

menuKinds.addEventListener('touchend', () => {
  isDown = false;
});

const kindBoxes = menuKinds.querySelectorAll('.kind-box');

kindBoxes.forEach((kindBox) => {
  kindBox.addEventListener('click', () => {
    kindBoxes.forEach((kb) => kb.classList.remove('active'));
    kindBox.classList.add('active');
  });
});
// -----------------------------------------
// Aside Buttons Gif Animated
// Get all buttons with the class "aside-button"
const buttons = document.querySelectorAll('.aside-button');

// Add an event listener to each button
buttons.forEach(button => {
  button.addEventListener('click', event => {
    // Get the button element (not the img element)
    const buttonElement = event.currentTarget;

    // Get the img element inside the button
    const img = buttonElement.querySelector('img');

    // Change the src attribute from .png to .gif
    const gifSrc = img.src.replace('.png', '.gif');
    img.src = gifSrc;

    // Change the src attribute back to .png after 0.4 seconds
    setTimeout(() => {
      img.src = img.src.replace('.gif', '.png');
    }, 1300);
  });
});