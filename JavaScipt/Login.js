import { db, doc, getDoc, setDoc } from './Firebase.js';

async function checkLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const alertElement = document.getElementById('alert');

  const userDocRef = doc(db, 'Users', username);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    if (userDocSnap.data().password === password) {
      const currentTime = new Date();
      const monthName = currentTime.toLocaleString('en-US', { month: 'long' });
      const monthNumber = currentTime.getMonth() + 1;
      const dayNumber = currentTime.getDate();
      const dayName = currentTime.toLocaleString('en-US', { weekday: 'long' });

      const dailyLoginRef = doc(db, 'DailyLogin', `${username}/${monthNumber} - ${monthName}`, `${dayNumber} - ${dayName}`);
      const dailyLoginSnap = await getDoc(dailyLoginRef);
      if (dailyLoginSnap.exists()) {
        await setDoc(dailyLoginRef, { count: dailyLoginSnap.data().count + 1 });
      } else {
        await setDoc(dailyLoginRef, { count: 1 });
      }

      const dailyLoginCount = (await getDoc(dailyLoginRef)).data().count;
      const randomLetters = Array(3).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65));
      const loginCode = `${username}-${dayNumber}/${monthNumber}/${currentTime.getFullYear()}-${currentTime.toLocaleTimeString().split(' ')[0].slice(0, 5)}-${dailyLoginCount}-${randomLetters.join('')}`;
      await setDoc(doc(db, 'LoginAuth', `Login-Code-${username}`), { code: loginCode });
      alertElement.textContent = `Hello, ${username}!`;
      setTimeout(() => {
        localStorage.setItem('username', username);
        window.location.href = 'Swing.html';
      }, 500);
    } else {
      alertElement.textContent = 'Invalid password';
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