import { db, doc, getDoc, setDoc, deleteField, writeBatch } from './Firebase.js';

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
window.addEventListener('load', () => {
  const username = localStorage.getItem('username');
  const greetingElement = document.getElementById('greeting');
  greetingElement.textContent = `Hello, ${username}!`;
});
