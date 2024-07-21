import { db, doc, getDoc, setDoc } from './Firebase.js';

// Function to check login credentials
async function checkLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const alertElement = document.getElementById('alert');

  // Reference to the user document in Firestore
  const userDocRef = doc(db, 'Users', username);
  const userDocSnap = await getDoc(userDocRef);

  // Check if the user exists
  if (userDocSnap.exists()) {
    // Check if the password is correct
    if (userDocSnap.data().password === password) {
      const currentTime = new Date();
      const monthName = currentTime.toLocaleString('en-US', { month: 'long' });
      const monthNumber = currentTime.getMonth() + 1;
      const dayNumber = currentTime.getDate();
      const dayName = currentTime.toLocaleString('en-US', { weekday: 'long' });

      // Reference to the daily login document in Firestore
      const dailyLoginRef = doc(db, 'DailyLogin', `${username}/${monthNumber} - ${monthName}`, `${dayNumber} - ${dayName}`);
      const dailyLoginSnap = await getDoc(dailyLoginRef);

      // Update the daily login count and add the current time to the login times array
      if (dailyLoginSnap.exists()) {
        await setDoc(dailyLoginRef, {
          loginCount: (dailyLoginSnap.data().loginCount || 0) + 1,
          loginTimes: [...(dailyLoginSnap.data().loginTimes || []), currentTime.toLocaleTimeString()],
        }, { merge: true });
      } else {
        await setDoc(dailyLoginRef, {
          loginCount: 1,
          loginTimes: [currentTime.toLocaleTimeString()],
        });
      }

      // Get the user's IP address
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip);

      // Check if the user has already logged in from another device
      const loginAuthRef = doc(db, 'LoginAuth', `Login-Code-${username}`);
      const loginAuthSnap = await getDoc(loginAuthRef);

      if (loginAuthSnap.exists()) {
        const existingIpAddresses = Object.values(loginAuthSnap.data()).filter(value => typeof value === 'string' && value.includes('.'));

        if (!existingIpAddresses.includes(ipAddress)) {
          // Add a new field for the new device
          const newIpField = `ipAddress${existingIpAddresses.length + 1}`;
          await setDoc(loginAuthRef, {
            [newIpField]: ipAddress,
          }, { merge: true });
        }
      } else {
        // Create a new LoginAuth document
        await setDoc(loginAuthRef, {
          ipAddress: ipAddress,
        });
      }

      // Display a success message and redirect to the next page
      alertElement.textContent = `Hello, ${username}!`;
      localStorage.setItem('username', username);
      window.location.href = 'Swing.html';
    } else {
      // Display an error message if the password is incorrect
      alertElement.textContent = 'Invalid password';
      setTimeout(() => {
        alertElement.textContent = '';
      }, 2000);
    }
  } else {
    // Display an error message if the user does not exist
    alertElement.textContent = 'User does not exist';
    setTimeout(() => {
      alertElement.textContent = '';
    }, 2000);
  }
}

// Add an event listener to the login form
document.getElementById('login-form').addEventListener('submit', checkLogin);
