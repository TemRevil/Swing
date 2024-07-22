import { db, doc, getDoc, setDoc, deleteDoc, deleteField, writeBatch } from './Firebase.js';
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
      // إنشاء Batch لحذف الحقل الخاص بالجهاز
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