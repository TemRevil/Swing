import { db, doc, getDoc, collection, getDocs, storage, ref, getDownloadURL } from './Firebase.js';

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
        window.location.href = 'Login.html';
      }
    } else {
      window.location.href = 'Login.html';
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

    window.location.href = 'Login.html';
  } catch (error) {
    console.error('Error deleting device field:', error);
  }
}
// -----------------------------------------
// Nav Greeting Message
window.addEventListener('load', async () => {
  await checkLoginStatus();
  const username = localStorage.getItem('username');
  const greetingElement = document.getElementById('greeting');

  if (username) {
    greetingElement.textContent = `Hello, ${username}!`;
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
// Restaurant Database Collecting
// Function to create divs based on button IDs
function createDivsBasedOnButtons() {
  const menuKindsContainer = document.getElementById('menu-kinds');
  const mainMenuContainer = document.getElementById('main-menu');
  
  // Iterate over each button in the menu kinds container and create a corresponding div in the main menu container
  Array.from(menuKindsContainer.getElementsByClassName('kind-box')).forEach(button => {
    mainMenuContainer.appendChild(document.createElement('div')).className = `${button.id.toLowerCase().replace(' ', '-')} flex row gap off`;
  });
}

// Function to fetch and display items for a given category
async function fetchAndDisplayItems(categoryId) {
  const username = localStorage.getItem('username');
  const categoryDocSnapshot = await getDoc(doc(db, `re-data/${username}/Menu/${categoryId}`));

  if (categoryDocSnapshot.exists()) {
    const categoryData = categoryDocSnapshot.data();
    const itemsHTML = await Promise.all(Object.keys(categoryData).map(async itemName => {
      const itemData = categoryData[itemName];

      // Get image URL from Firebase Storage, fallback to local image if not found
      const itemImg = await getDownloadURL(ref(storage, `${username}/${itemName}.png`)).catch(() => `/Backround/Menu/${itemName}.png`);

      return `
        <div class="item-box flex col between">
          <p class="text" id="item-name">${itemName}</p>
          <div class="img"><img src="${itemImg}" alt="#"></div>
          <p class="flex text" id="item-price">${itemData.Price || 0} EPG</p>
        </div>
      `;
    }));

    // Find the corresponding div in the main menu container and set its innerHTML
    document.getElementById('main-menu').querySelector(`.${categoryId.toLowerCase().replace(' ', '-')}`).innerHTML = itemsHTML.join('');
  }
}

// Initialize data and create divs for menu items
const username = localStorage.getItem('username');
const menuRef = collection(db, `re-data/${username}/Menu`);

getDocs(menuRef).then(querySnapshot => {
  // Generate HTML for menu kinds buttons
  document.getElementById('menu-kinds').innerHTML = querySnapshot.docs.map(doc => `
    <button class="kind-box flex center text" id="${doc.id}">
      ${doc.id.replace('-', ' ')}
    </button>
  `).join('');
  
  createDivsBasedOnButtons();
  
  // Dispatch custom event to indicate menu data has been loaded
  window.dispatchEvent(new Event('menuDataLoaded'));
}).catch(error => console.error('Error collecting menu data:', error));

export { fetchAndDisplayItems };