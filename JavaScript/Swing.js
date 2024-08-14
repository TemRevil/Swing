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
// Menu Kinds = Menu View in Main Menu
// Function to handle button click and manage active state
import { fetchAndDisplayItems } from './Swing-Base.js';

// Function to handle button click and manage active state
function handleButtonClick() {
  const buttons = document.querySelectorAll('.kind-box');
  const mainMenuContainer = document.getElementById('main-menu');

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      // Remove 'active' class from all buttons and add 'off' class to all divs
      buttons.forEach(btn => {
        btn.classList.remove('active');
        const div = mainMenuContainer.querySelector(`.${btn.id.toLowerCase().replace(' ', '-')}`);
        if (div) {
          div.classList.add('off');
        }
      });

      // Add 'active' class to the clicked button and remove 'off' class from corresponding div
      button.classList.add('active');
      const activeDiv = mainMenuContainer.querySelector(`.${button.id.toLowerCase().replace(' ', '-')}`);
      if (activeDiv) {
        activeDiv.classList.remove('off');
        // Fetch and display items for the active category
        await fetchAndDisplayItems(button.id);
      }
    });
  });
}

// Initialize functions after menu data is loaded
window.addEventListener('menuDataLoaded', () => {
  handleButtonClick();
});
// -----------------------------------------
// Menu Kinds Slider
const menuKinds = document.querySelector('.menu-kinds');
let isDown = false;
let startX;
let scrollLeft;

const handleMouseDown = (e) => {
  isDown = true;
  startX = e.type === 'touchstart'? e.touches[0].pageX : e.pageX;
  scrollLeft = menuKinds.scrollLeft;
};

const handleMouseMove = (e) => {
  if (!isDown) return;
  const x = e.type === 'touchmove'? e.touches[0].pageX : e.pageX;
  const walk = x - startX;
  menuKinds.scrollLeft = scrollLeft - walk;
};

const handleMouseUp = () => {
  isDown = false;
};

menuKinds.addEventListener('mousedown', handleMouseDown);
menuKinds.addEventListener('touchstart', handleMouseDown);
menuKinds.addEventListener('mousemove', handleMouseMove);
menuKinds.addEventListener('touchmove', handleMouseMove);
menuKinds.addEventListener('mouseup', handleMouseUp);
menuKinds.addEventListener('touchend', handleMouseUp);

const kindBoxes = menuKinds.querySelectorAll('.kind-box');

kindBoxes.forEach((kindBox) => {
  kindBox.addEventListener('click', () => {
    kindBoxes.forEach((kb) => kb.classList.remove('active'));
    kindBox.classList.add('active');
  });
});

const menuItems = document.querySelectorAll('.main-menu > div');

kindBoxes.forEach((kindBox) => {
  kindBox.addEventListener('click', () => {
    kindBoxes.forEach((kb) => kb.classList.remove('active'));
    kindBox.classList.add('active');

    const id = kindBox.id;
    menuItems.forEach((menuItem) => {
      if (menuItem.classList.contains(id)) {
        menuItem.classList.remove('off');
      } else {
        menuItem.classList.add('off');
      }
    });
  });
});
// -----------------------------------------
// Aside Buttons Gif Animated
// Get all buttons with the class "aside-button"
const buttons = document.querySelectorAll('.aside-button');

// Add an event listener to each button
buttons.forEach(button => {
  button.addEventListener('click', event => {
    // Get the button element (not the img element)
    const buttonElement = event.currentTarget;

    // Get the img element inside the button
    const img = buttonElement.querySelector('img');

    // Change the src attribute from .png to .gif
    const gifSrc = img.src.replace('.png', '.gif');
    img.src = gifSrc;

    // Change the src attribute back to .png after 0.4 seconds
    setTimeout(() => {
      img.src = img.src.replace('.gif', '.png');
    }, 950);
  });
});
// -----------------------------------------
// Modal Close Event
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const wh = document.querySelector('.wh');
    if (wh) {
      wh.classList.add('off');
    }
  }
});
// -----------------------------------------
// Order Modal Main Events
const unsplashAccessKey = 'q0PmfRd9boo7_U1FJP7y1iRVbP1AiHUcPckKcsgb_ac';
const orderModal = document.querySelector('.order-modal');
const orderCoverImg = document.getElementById('order-cover');
const orderCoverName = document.getElementById('order-cover-name');
const orderModalTitle = document.querySelector('#order-modal-title .title');
const imgOrderBox = document.querySelector('#img-order-box img');
const orderPrice = document.getElementById('order-price');

async function openModal(itemBox) {
  const itemName = itemBox.querySelector('#item-name').textContent;
  const itemImgSrc = itemBox.querySelector('img').src;
  const itemPrice = itemBox.querySelector('#item-price').textContent;
  const activeKindName = [...document.querySelectorAll('.kind-box')].find(kindBox => kindBox.classList.contains('active')).textContent.trim();

  orderModalTitle.textContent = itemName;
  imgOrderBox.src = itemImgSrc;
  orderPrice.textContent = itemPrice;
  orderCoverName.textContent = itemName;
  document.getElementById('order-kind-name').textContent = activeKindName;

  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${activeKindName}+${itemName}+food&orientation=squarish&content_filter=low&client_id=${unsplashAccessKey}`);
    const data = await response.json();
    orderCoverImg.src = data.results.length > 0 ? data.results[Math.floor(Math.random() * data.results.length)].urls.regular : itemImgSrc;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    orderCoverImg.src = itemImgSrc;
  }

  orderModal.classList.remove('off');
}

document.querySelectorAll('.item-box').forEach(itemBox => itemBox.addEventListener('click', () => openModal(itemBox)));
document.getElementById('close-order-modal').addEventListener('click', () => orderModal.classList.add('off'));
window.addEventListener('menuDataLoaded', () => document.querySelectorAll('.item-box').forEach(itemBox => itemBox.addEventListener('click', () => openModal(itemBox))));

export function attachModalEventListeners() {
  document.querySelectorAll('.item-box').forEach(itemBox => itemBox.addEventListener('click', () => openModal(itemBox)));
}

// Modal Options Contorl
// Get the quantity input and buttons
const quantityInput = document.getElementById('order-quantity');
const decreaseButton = document.getElementById('decrease-quantity');
const increaseButton = document.getElementById('increase-quantity');

// Add event listeners to the buttons
decreaseButton.addEventListener('click', decreaseQuantity);
increaseButton.addEventListener('click', increaseQuantity);

// Function to decrease the quantity
function decreaseQuantity() {
  const currentValue = parseInt(quantityInput.value);
  if (currentValue > 1) {
    quantityInput.value = currentValue - 1;
  }
}

// Function to increase the quantity
function increaseQuantity() {
  const currentValue = parseInt(quantityInput.value);
  quantityInput.value = currentValue + 1;
}