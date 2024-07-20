// Swing Guradian
import { db, doc, getDoc, deleteDoc } from './Firebase.js';

// Get the username from local storage
const username = localStorage.getItem('username');

// Check if the login code is valid
const loginCodeRef = doc(db, 'LoginAuth', `Login-Code-${username}`);
getDoc(loginCodeRef).then((doc) => {
  if (!doc.exists()) {
    // If no code is found, redirect to Login.html
    window.location.href = 'Login.html';
  } else {
    const loginCode = doc.data().code;
    // Verify the code (you can add your own verification logic here)
    const isValidCode = verifyLoginCode(loginCode);

    if (!isValidCode) {
      // If the code is invalid, redirect to Login.html
      window.location.href = 'Login.html';
    } else {
      // If the code is valid, allow access to Swing.html
      console.log('Welcome to Swing.html!');
    }
  }
}).catch((error) => {
  console.error('Error getting login code:', error);
});

// Example verification function (you can modify this to fit your needs)
function verifyLoginCode(code) {
  // For demonstration purposes, let's say the code is valid if it's at least 8 characters long
  return code.length >= 8;
}
// -----------------------------------------
// Auth Gurdian Helper
document.getElementById('logout-yes').addEventListener('click', logout);

async function logout() {
  const username = localStorage.getItem('username');
  const loginCodeRef = doc(db, 'LoginAuth', `Login-Code-${username}`);

  try {
    await deleteDoc(loginCodeRef);
    localStorage.removeItem('username');
    window.location.href = 'Login.html';
  } catch (error) {
    console.error('Error deleting login code:', error);
  }
}
// -----------------------------------------
// Nav Greeting Message
window.addEventListener('load', () => {
  const username = localStorage.getItem('username');
  const greetingElement = document.getElementById('greeting');
  greetingElement.textContent = `Hello, ${username}!`;
});
// -----------------------------------------
// Logout Event
const logoutModal = document.querySelector('.logout-modal');

document.getElementById('logout-modal').addEventListener('click', () => {
  logoutModal.classList.remove('off');
});

document.getElementById('logout-no').addEventListener('click', () => {
  logoutModal.classList.add('off');
});

// Add event listener to close logoutModal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target === logoutModal || e.target.classList.contains('logout-modal')) {
    logoutModal.classList.add('off');
  }
});
// -----------------------------------------
// Menu Kinds Slider
const menuKinds = document.querySelector('.menu-kinds');
let isDown = false;
let startX;
let scrollLeft;

const handleMouseDown = (e) => {
  isDown = true;
  startX = e.type === 'touchstart'? e.touches[0].pageX : e.pageX;
  scrollLeft = menuKinds.scrollLeft;
};

const handleMouseMove = (e) => {
  if (!isDown) return;
  const x = e.type === 'touchmove'? e.touches[0].pageX : e.pageX;
  const walk = x - startX;
  menuKinds.scrollLeft = scrollLeft - walk;
};

const handleMouseUp = () => {
  isDown = false;
};

menuKinds.addEventListener('mousedown', handleMouseDown);
menuKinds.addEventListener('touchstart', handleMouseDown);
menuKinds.addEventListener('mousemove', handleMouseMove);
menuKinds.addEventListener('touchmove', handleMouseMove);
menuKinds.addEventListener('mouseup', handleMouseUp);
menuKinds.addEventListener('touchend', handleMouseUp);

const kindBoxes = menuKinds.querySelectorAll('.kind-box');

kindBoxes.forEach((kindBox) => {
  kindBox.addEventListener('click', () => {
    kindBoxes.forEach((kb) => kb.classList.remove('active'));
    kindBox.classList.add('active');
  });
});

const menuItems = document.querySelectorAll('.main-menu > div');

kindBoxes.forEach((kindBox) => {
  kindBox.addEventListener('click', () => {
    kindBoxes.forEach((kb) => kb.classList.remove('active'));
    kindBox.classList.add('active');

    const id = kindBox.id;
    menuItems.forEach((menuItem) => {
      if (menuItem.classList.contains(id)) {
        menuItem.classList.remove('off');
      } else {
        menuItem.classList.add('off');
      }
    });
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
    }, 950);
  });
});
// -----------------------------------------
