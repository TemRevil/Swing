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
// Order Modal Main Event

// Select modal elements
const orderModal = document.querySelector('.order-modal');
const orderCoverImg = document.getElementById('order-cover');
const orderCoverName = document.getElementById('order-cover-name');
const orderModalTitle = document.querySelector('#order-modal-title .title');
const imgOrderBox = document.querySelector('#img-order-box img');
const orderPrice = document.getElementById('order-price');

// Function to handle opening the modal with item data
function openModal(itemBox) {
  // Get data from the clicked item
  const itemName = itemBox.querySelector('#item-name').textContent;
  const itemImgSrc = itemBox.querySelector('img').src;
  const itemPrice = itemBox.querySelector('#item-price').textContent;

  // Transfer data to the modal
  orderCoverImg.src = itemImgSrc;
  orderCoverName.textContent = itemName;
  orderModalTitle.textContent = itemName; // Set the product title in the modal
  imgOrderBox.src = itemImgSrc; // Set the product image in the modal
  orderPrice.textContent = itemPrice; // Set the price in the modal

  // Show the modal by removing the "off" class
  orderModal.classList.remove('off');
}

// Function to add click event to all item boxes
function addClickEventToItemBoxes() {
  // Select all item boxes
  const itemBoxes = document.querySelectorAll('.item-box');

  // Add click event to each item box
  itemBoxes.forEach(itemBox => {
    itemBox.addEventListener('click', () => openModal(itemBox));
  });
}

// Add click event to item boxes after data is loaded
window.addEventListener('menuDataLoaded', () => {
  addClickEventToItemBoxes();
});

// Close the modal
document.getElementById('close-order-modal').addEventListener('click', () => {
  orderModal.classList.add('off');
});
