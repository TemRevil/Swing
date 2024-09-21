import { db, doc, getDoc, writeBatch, deleteField, setDoc } from './Firebase.js';

// -----------------------------------------
// Check Login Status
async function checkLoginStatus() {
  const username = localStorage.getItem('username');
  const deviceName = localStorage.getItem('device');

  if (username && deviceName) {
    const loginAuthRef = doc(db, 'LoginAuth', `Login-Code-${username}`);
    const loginAuthSnap = await getDoc(loginAuthRef);

    if (!loginAuthSnap.exists() || !loginAuthSnap.data()[deviceName]) {
      alert('Session expired. Please log in again.');
      localStorage.removeItem('username');
      localStorage.removeItem('device');
      window.location.href = 'Login.html'; // Redirect to login page
    }
  } else {
    window.location.href = 'Login.html'; // Redirect to login page
  }
}
// -----------------------------------------
// Auth Guardian Helper
document.getElementById('logout-yes').addEventListener('click', logout);

async function logout() {
  const username = localStorage.getItem('username');
  const deviceName = localStorage.getItem('device');
  const loginAuthRef = doc(db, 'LoginAuth', `Login-Code-${username}`);
  const dailyLoginRef = doc(db, 'DailyLogin', `${username}/${new Date().getMonth() + 1} - ${new Date().toLocaleString('en-US', { month: 'long' })}`, `${new Date().getDate()} - ${new Date().toLocaleString('en-US', { weekday: 'long' })}`);

  try {
    if (deviceName) {
      const batch = writeBatch(db);
      batch.update(loginAuthRef, {
        [deviceName]: deleteField()
      });

      await batch.commit();
      localStorage.removeItem('device');
    }

    localStorage.removeItem('username');

    // Add logout time and count to the daily login document
    const dailyLoginSnap = await getDoc(dailyLoginRef);
    if (dailyLoginSnap.exists()) {
      await setDoc(dailyLoginRef, {
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

    window.location.href = 'Login.html'; // Redirect to login page after logout
  } catch (error) {
    console.error('Error deleting device field:', error);
  }
}
// -----------------------------------------
// Greeting Message
window.addEventListener('load', async () => {
    await checkLoginStatus();
    const username = localStorage.getItem('username');
    const usernameElement = document.getElementById('username');
  
    if (username && usernameElement) {
      usernameElement.textContent = `${username}!`;
    }
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
// Navigation Scrolling Orders
const navbars = document.querySelectorAll('nav');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = 500;
    const threshold = 250;

    navbars.forEach((navbar) => {
        if (scrollY > threshold) {
            navbar.classList.add('scrolled');
            navbar.style.boxShadow = `0 0 ${250 + (Math.min((scrollY - threshold) / (maxScroll - threshold), 1) * 50)}px #1234564b`;
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.boxShadow = '0 0 250px #1234564b';
        }
    });
});
// -----------------------------------------
// Conic Gradient Code
const CONFIG = {
    gradient: true,
    animated: true,
    dark: false,
    highlight: 2,
    spread: 1,
    primary: "#3395ff",
    secondary: "#606060",
};
  
const UPDATE = () => {
    for (const key of Object.keys(CONFIG)) {
      document.documentElement.style.setProperty(`--${key}`, CONFIG[key]);
    }
    document.documentElement.dataset.gradient = CONFIG.gradient;
    document.documentElement.dataset.animate = CONFIG.animated;
    document.documentElement.dataset.theme = CONFIG.dark ? "dark" : "light";
};
  
UPDATE();
// -----------------------------------------
// Get all cards and content area elements
const cards = document.querySelectorAll('.card');
const contentArea = document.getElementById('content');

// Check if content area exists
if (!contentArea) {
    console.error("Element with id 'content' not found.");
}

// Add event listener to each card
cards.forEach((card) => {
    card.addEventListener('click', () => {
        const cardId = card.id;
        const url = `${cardId.toLowerCase()}.html`;

        // Check if the page should be loaded normally
        if (url === 'swing.html' || url === 'dispatcher.html') {
            // Redirect to the page normally
            window.location.href = url;
        } else {
            // Fetch the content without reloading the page
            fetch(url)
                .then(response => response.text())
                .then(html => {
                    // Update the content area with the new HTML
                    contentArea.innerHTML = html;

                    // Remove the 'off' class from #content
                    contentArea.classList.remove('off');

                    // Add overflow: hidden to body to prevent scrolling outside #content
                    document.body.style.overflow = 'hidden';
                })
                .catch(error => console.error('Fetch error:', error));
        }
    });
});

// Handle the browser's back/forward button
window.addEventListener('popstate', (event) => {
    if (event.state && contentArea) {
        // Restore the content from history
        contentArea.innerHTML = event.state.html;

        // Remove the 'off' class from #content when restoring content
        contentArea.classList.remove('off');

        // Add overflow: hidden to body when restoring content
        document.body.style.overflow = 'hidden';
    }
});
// -----------------------------------------
