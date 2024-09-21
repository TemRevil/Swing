import { db, doc, getDoc, setDoc } from './Firebase.js';

async function checkLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.toLowerCase();
  const password = document.getElementById('password').value;
  const alertElement = document.getElementById('alert');

  try {
    const userDocRef = doc(db, 'Users', username);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const { Subscription: subscriptionData, password: storedPassword } = userDocSnap.data();

      if (subscriptionData?.States === 'Activated' && storedPassword === password) {
        const currentTime = new Date();
        const dailyLoginRef = doc(db, 'DailyLogin', `${username}/${currentTime.getMonth() + 1} - ${currentTime.toLocaleString('en-US', { month: 'long' })}`, `${currentTime.getDate()} - ${currentTime.toLocaleString('en-US', { weekday: 'long' })}`);
        const dailyLoginSnap = await getDoc(dailyLoginRef);

        const loginAuthRef = doc(db, 'LoginAuth', `Login-Code-${username}`);
        const loginAuthSnap = await getDoc(loginAuthRef);

        const ipAddress = await fetch('https://api.ipify.org?format=json').then(response => response.json()).then(data => data.ip);
        const domain = window.location.hostname;

        let deviceCount = 1;
        let isNewDevice = true;
        const maxDevices = parseInt(subscriptionData.Devices, 10) || 1;

        if (loginAuthSnap.exists()) {
          const existingDevices = Object.keys(loginAuthSnap.data()).filter(key => key.startsWith('device'));

          if (existingDevices.length >= maxDevices) {
            showAlert('Device limit reached. Cannot log in from a new device.');
            return;
          }

          for (const device of existingDevices) {
            const deviceData = loginAuthSnap.data()[device];
            if (deviceData.ipAddress === ipAddress && deviceData.domain === domain) {
              isNewDevice = false;
              localStorage.setItem('device', device);
              break;
            }
          }

          if (isNewDevice) {
            deviceCount = existingDevices.length + 1;
          }
        }

        if (isNewDevice) {
          const loginCode = `${username}-${currentTime.getDate()}/${currentTime.getMonth() + 1}/${currentTime.getFullYear()}-${currentTime.toLocaleTimeString().split(' ')[0].slice(0, 5)}-${(dailyLoginSnap.data()?.loginCount || 0) + 1}-${generateRandomCode()}`;
          const newDeviceKey = `device${deviceCount}`;
          await setDoc(loginAuthRef, { [newDeviceKey]: { code: loginCode, ipAddress, domain } }, { merge: true });
          localStorage.setItem('device', newDeviceKey);
        }

        await setDoc(dailyLoginRef, {
          loginCount: (dailyLoginSnap.data()?.loginCount || 0) + 1,
          loginTimes: [...(dailyLoginSnap.data()?.loginTimes || []), currentTime.toLocaleTimeString()],
        }, { merge: true });

        showAlert(`Hello, ${username}!`);
        localStorage.setItem('username', username);
        window.location.href = 'Main-Menu.html'; // Redirect to Main-Menu.html
      } else if (storedPassword !== password) {
        showAlert('Invalid password');
      } else {
        showAlert('Account deactivated');
      }
    } else {
      showAlert('User does not exist');
    }
  } catch (error) {
    console.error('Error during login process:', error);
    showAlert('An error occurred. Please try again later.');
  }
}

function showAlert(message) {
  const alertElement = document.getElementById('alert');
  alertElement.textContent = message;
  setTimeout(() => {
    alertElement.textContent = '';
  }, 2000);
}

function generateRandomCode() {
  return Array(3).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');
}

document.getElementById('login-form').addEventListener('submit', checkLogin);
