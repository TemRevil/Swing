import { db, doc, getDoc, setDoc, updateDoc } from './Firebase.js';

async function checkLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const alertElement = document.getElementById('alert');

  const userDocRef = doc(db, 'Users', username);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists() && userDocSnap.data().password === password) {
    const currentTime = new Date();
    const dailyLoginRef = doc(db, 'DailyLogin', `${username}/${currentTime.getMonth() + 1} - ${currentTime.toLocaleString('en-US', { month: 'long' })}`, `${currentTime.getDate()} - ${currentTime.toLocaleString('en-US', { weekday: 'long' })}`);
    const dailyLoginSnap = await getDoc(dailyLoginRef);

    await setDoc(dailyLoginRef, {
      loginCount: (dailyLoginSnap.data()?.loginCount || 0) + 1,
      loginTimes: [...(dailyLoginSnap.data()?.loginTimes || []), currentTime.toLocaleTimeString()],
    }, { merge: true });

    const loginCode = `${username}-${currentTime.getDate()}/${currentTime.getMonth() + 1}/${currentTime.getFullYear()}-${currentTime.toLocaleTimeString().split(' ')[0].slice(0, 5)}-${(await getDoc(dailyLoginRef)).data().loginCount}-${Array(3).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('')}`;

    const ipAddress = await fetch('https://api.ipify.org?format=json').then(response => response.json()).then(data => data.ip);
    const domain = window.location.hostname;

    const loginAuthRef = doc(db, 'LoginAuth', `Login-Code-${username}`);
    const loginAuthSnap = await getDoc(loginAuthRef);

    let deviceCount = 1;
    if (loginAuthSnap.exists()) {
      const existingDevices = Object.keys(loginAuthSnap.data()).filter(key => key.startsWith('device'));
      deviceCount = existingDevices.length + 1;
    }

    await updateDoc(loginAuthRef, { [`device${deviceCount}`]: { code: loginCode, ipAddress, domain } }, { merge: true });

    alertElement.textContent = `Hello, ${username}!`;
    localStorage.setItem('username', username);
    window.location.href = 'Swing.html';
  } else {
    alertElement.textContent = userDocSnap.exists() ? 'Invalid password' : 'User does not exist';
    setTimeout(() => {
      alertElement.textContent = '';
    }, 2000);
  }
}

document.getElementById('login-form').addEventListener('submit', checkLogin);