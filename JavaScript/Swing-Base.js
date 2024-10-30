import { db, doc, getDoc, collection, getDocs, storage, ref, getDownloadURL, writeBatch, deleteField, setDoc } from './Firebase.js';

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
import { attachModalEventListeners } from './Swing.js';

// Function to create divs based on button IDs
function createDivsBasedOnButtons() {
  const menuKindsContainer = document.getElementById('menu-kinds');
  const mainMenuContainer = document.getElementById('main-menu');

  // Iterate over each button in the menu kinds container
  Array.from(menuKindsContainer.getElementsByClassName('kind-box')).forEach(button => {
    const newDiv = document.createElement('div');
    newDiv.className = `${button.id.toLowerCase().replace(' ', '-')} flex row gap off`;
    mainMenuContainer.appendChild(newDiv);
  });
}

async function fetchAndDisplayItems(categoryId) {
  const username = localStorage.getItem('username');
  const categoryDocSnapshot = await getDoc(doc(db, `re-data/${username}/Menu/${categoryId}`));

  if (categoryDocSnapshot.exists()) {
    const categoryData = categoryDocSnapshot.data();

    // Sort item names alphabetically
    const sortedItemNames = Object.keys(categoryData).sort((a, b) => a.localeCompare(b));

    // Generate HTML for items
    const itemsHTML = await Promise.all(sortedItemNames.map(async itemName => {
      const itemData = categoryData[itemName];

      // Get image URL from Firebase Storage, fallback to local image if not found
      const itemImg = await getDownloadURL(ref(storage, `${username}/Menu/${categoryId}/${itemName}.png`))
        .catch(() => `/Backround/Menu/${itemName}.png`);

      // Store options in item data (if available)
      const options = itemData.Options || {};

      // Retrieve item price from Fees
      const itemPrice = itemData.Fees?.Price || 0; // Using optional chaining for cleaner code

      // Add fees data attribute
      const feesData = JSON.stringify(itemData.Fees) || '{}';

      return {
        html: `
          <div class="item-box flex col between" 
               data-item-data='${JSON.stringify({ ...itemData, options })}' 
               data-item-fees='${feesData}'>
            <p class="text" id="item-name">${itemName}</p>
            <div class="img"><img src="${itemImg}" alt="#"></div>
            <p class="flex text" id="item-price">${itemPrice} EPG</p>
          </div>
        `,
        options: options,
        name: itemName,
        price: itemPrice
      };
    }));

    // Update the main menu container with the generated HTML
    const mainMenuDiv = document.getElementById('main-menu').querySelector(`.${categoryId.toLowerCase().replace(' ', '-')}`);
    mainMenuDiv.innerHTML = itemsHTML.map(item => item.html).join('');

    // Attach event listeners to new item-box elements after they are added to the DOM
    attachModalEventListeners(itemsHTML);
  } else {
    console.error('Category document does not exist');
  }
}

// Initialize data and create divs for menu items
const username = localStorage.getItem('username');
const menuRef = collection(db, `re-data/${username}/Menu`);

getDocs(menuRef).then(querySnapshot => {
  // Generate HTML for menu kinds buttons
  const menuKindsHTML = querySnapshot.docs.map(doc => `
    <button class="kind-box flex center text" id="${doc.id}">
      ${doc.id.replace('-', ' ')}
    </button>
  `).join('');

  document.getElementById('menu-kinds').innerHTML = menuKindsHTML;
  createDivsBasedOnButtons();

  // Add event listeners to kind buttons
  const kindButtons = document.getElementById('menu-kinds').getElementsByClassName('kind-box');
  Array.from(kindButtons).forEach(button => {
    button.addEventListener('click', () => fetchAndDisplayItems(button.id));
  });

  // Dispatch custom event to indicate menu data has been loaded
  window.dispatchEvent(new Event('menuDataLoaded'));
}).catch(error => console.error('Error collecting menu data:', error));

// Export the fetchAndDisplayItems function
export { fetchAndDisplayItems };
