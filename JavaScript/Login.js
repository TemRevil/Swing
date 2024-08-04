import { db, doc, getDoc, setDoc } from './Firebase.js';

async function checkLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const alertElement = document.getElementById('alert');

  const userDocRef = doc(db, 'Users', username);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    const subscriptionData = userData.Subscription;

    if (subscriptionData && subscriptionData.States === 'Activated') {
      if (userData.password === password) {
        const currentTime = new Date();
        const dailyLoginRef = doc(db, 'DailyLogin', `${username}/${currentTime.getMonth() + 1} - ${currentTime.toLocaleString('en-US', { month: 'long' })}`, `${currentTime.getDate()} - ${currentTime.toLocaleString('en-US', { weekday: 'long' })}`);
        const dailyLoginSnap = await getDoc(dailyLoginRef);

        // تحقق من الأجهزة المسجلة
        const loginAuthRef = doc(db, 'LoginAuth', `Login-Code-${username}`);
        const loginAuthSnap = await getDoc(loginAuthRef);

        let deviceCount = 1;
        let isNewDevice = true;
        let maxDevices = parseInt(subscriptionData.Devices, 10) || 1;

        const ipAddress = await fetch('https://api.ipify.org?format=json').then(response => response.json()).then(data => data.ip);
        const domain = window.location.hostname;

        if (loginAuthSnap.exists()) {
          const existingDevices = Object.keys(loginAuthSnap.data()).filter(key => key.startsWith('device'));

          // إذا كانت الأجهزة الحالية قد وصلت إلى الحد الأقصى
          if (existingDevices.length >= maxDevices) {
            alertElement.textContent = 'Device limit reached. Cannot log in from a new device.';
            setTimeout(() => {
              alertElement.textContent = '';
            }, 2000);
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
          const loginCode = `${username}-${currentTime.getDate()}/${currentTime.getMonth() + 1}/${currentTime.getFullYear()}-${currentTime.toLocaleTimeString().split(' ')[0].slice(0, 5)}-${(dailyLoginSnap.data()?.loginCount || 0) + 1}-${Array(3).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('')}`;

          const newDeviceKey = `device${deviceCount}`;
          await setDoc(loginAuthRef, { [newDeviceKey]: { code: loginCode, ipAddress, domain } }, { merge: true });
          localStorage.setItem('device', newDeviceKey);
        }

        // تسجيل دخول يومي
        await setDoc(dailyLoginRef, {
          loginCount: (dailyLoginSnap.data()?.loginCount || 0) + 1,
          loginTimes: [...(dailyLoginSnap.data()?.loginTimes || []), currentTime.toLocaleTimeString()],
        }, { merge: true });

        alertElement.textContent = `Hello, ${username}!`;
        localStorage.setItem('username', username);
        window.location.href = 'Swing.html';
      } else {
        alertElement.textContent = 'Invalid password';
        setTimeout(() => {
          alertElement.textContent = '';
        }, 2000);
      }
    } else {
      alertElement.textContent = 'Account deactivated';
      setTimeout(() => {
        alertElement.textContent = '';
      }, 2000);
    }
  } else {
    alertElement.textContent = 'User does not exist';
    setTimeout(() => {
      alertElement.textContent = '';
    }, 2000);
  }
}

document.getElementById('login-form').addEventListener('submit', checkLogin);
