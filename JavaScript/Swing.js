import { db, doc, getDoc, deleteDoc, setDoc, updateDoc } from './Firebase.js';

// -----------------------------------------
// Auth Guardian Helper
document.getElementById('logout-yes').addEventListener('click', logout);

async function logout() {
  const username = localStorage.getItem('username');
  const loginCodeRef = doc(db, 'LoginAuth', `Login-Code-${username}`);
  const dailyLoginRef = doc(db, 'DailyLogin', `${username}/${new Date().getMonth() + 1} - ${new Date().toLocaleString('en-US', { month: 'long' })}`, `${new Date().getDate()} - ${new Date().toLocaleString('en-US', { weekday: 'long' })}`);

  try {
    await deleteDoc(loginCodeRef);
    localStorage.removeItem('username');

    // Add logout time and count to the daily login document
    const dailyLoginSnap = await getDoc(dailyLoginRef);
    if (dailyLoginSnap.exists()) {
      await updateDoc(dailyLoginRef, {
        loginCount: dailyLoginSnap.data().loginCount,
        loginTimes: dailyLoginSnap.data().loginTimes,
        logoutCount: (dailyLoginSnap.data().logoutCount || 0) + 1,
        logoutTimes: [...(dailyLoginSnap.data().logoutTimes || []), new Date().toLocaleTimeString()],
      }, { merge: true });
    } else {
      await setDoc(dailyLoginRef, {
        loginCount: 0,
        loginTimes: [],
        logoutCount: 1,
        logoutTimes: [new Date().toLocaleTimeString()],
      });
    }

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
