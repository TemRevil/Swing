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
const quantityInput = document.getElementById('order-quantity');
const decreaseButton = document.getElementById('decrease-quantity');
const increaseButton = document.getElementById('increase-quantity');

let previousQuantity = parseInt(quantityInput.value); // Store previous quantity

// Open modal function
async function openModal(itemBox, itemData) {
  if (!itemData) return console.error('itemData is undefined');

  const { itemName, itemImgSrc, itemPrice, activeKindName } = getItemDetails(itemBox);

  updateModalContent(itemName, itemImgSrc, itemPrice, activeKindName);

  try {
    const response = await fetchUnsplashImage(activeKindName, itemName);
    const data = await response.json();
    orderCoverImg.src = data.results.length > 0 ? data.results[Math.floor(Math.random() * data.results.length)].urls.regular : itemImgSrc;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    orderCoverImg.src = itemImgSrc;
  }

  renderOptions(itemData.options);

  orderModal.classList.remove('off'); // Add this line to show the modal
}

// Get item details function
function getItemDetails(itemBox) {
  return {
    itemName: itemBox.querySelector('#item-name').textContent,
    itemImgSrc: itemBox.querySelector('img').src,
    itemPrice: itemBox.querySelector('#item-price').textContent,
    activeKindName: [...document.querySelectorAll('.kind-box')].find(kindBox => kindBox.classList.contains('active')).textContent.trim(),
  };
}

// Update modal content function
function updateModalContent(itemName, itemImgSrc, itemPrice, activeKindName) {
  orderModalTitle.textContent = itemName;
  imgOrderBox.src = itemImgSrc;
  orderPrice.textContent = itemPrice;
  orderCoverName.textContent = itemName;
  document.getElementById('order-kind-name').textContent = activeKindName;
}

// Render options function
function renderOptions(options) {
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.className = 'flex col gap';
  optionsContainer.innerHTML = '';

  if (options) {
    const optionKeys = Object.keys(options);
    let sizeOptions;

    // Check if Size option is present
    if (optionKeys.includes('Size')) {
      sizeOptions = options['Size'];
      renderOption('Size', sizeOptions, optionsContainer);
    }

    // Render other options
    optionKeys.forEach((optionKey) => {
      if (optionKey !== 'Size') {
        const option = options[optionKey];
        renderOption(optionKey, option, optionsContainer);
      }
    });
  } else {
    console.error('itemData.options is undefined');
  }

  attachEventListenersToButtons(optionsContainer);
}

function renderOption(optionName, option, optionsContainer) {
  const optionLabel = document.createElement('p');
  optionLabel.className = 'align';
  optionLabel.textContent = optionName;
  optionsContainer.appendChild(optionLabel);

  const optionButtonsContainer = document.createElement('div');
  optionButtonsContainer.className = 'flex row wrap gap';

  const isActiveReq = option['Active-Req'] === 'Yes';
  const activeAllowed = option['Active-Allowed'];
  const activeMax = option['Active-Max'];
  const activeMin = option['Active-Min'];

  console.log(`Rendering option ${optionName} with Active-Req: ${isActiveReq}, Active-Allowed: ${activeAllowed}, Active-Max: ${activeMax}, Active-Min: ${activeMin}`);

  Object.keys(option).forEach((optionValue) => {
    if (!['Active-Req', 'Active-Allowed', 'Active-Max', 'Active-Min'].includes(optionValue)) {
      const optionButton = document.createElement('button');
      optionButton.className = 'choice-btn text';
      optionButton.textContent = optionValue;
      if (isActiveReq) {
        optionButton.required = true;
        optionButton.dataset.activeAllowed = activeAllowed;
        optionButton.dataset.activeMax = activeMax;
        optionButton.dataset.activeMin = activeMin;
      }
      optionButtonsContainer.appendChild(optionButton);
    }
  });

  optionsContainer.appendChild(optionButtonsContainer);
}

// Attach event listeners to buttons function
function attachEventListenersToButtons(optionsContainer) {
  document.querySelectorAll('.choice-btn').forEach((button) => {
    let longPressTimeout;

    button.addEventListener('mousedown', () => {
      longPressTimeout = setTimeout(() => {
        longPressTimeout = null;
        const longPressEvent = new CustomEvent('longPress');
        button.dispatchEvent(longPressEvent);
      }, 1000);
    });

    button.addEventListener('mouseup', () => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        longPressTimeout = null;
      }
    });

    button.addEventListener('click', (event) => {
      if (longPressTimeout) {
        event.detail = { longPress: true };
      }
      toggleActiveClass(event, optionsContainer);
    });

    button.addEventListener('longPress', (event) => {
      toggleActiveClass({ target: button, detail: { longPress: true } }, optionsContainer);
    });
  });
}

// Toggle active class function
function toggleActiveClass(event, optionsContainer) {
  const button = event.target;
  const optionName = button.parentNode.parentNode.querySelector('p.align').textContent;
  const optionButtons = button.parentNode.querySelectorAll('button.choice-btn');
  const maxQuantity = parseInt(quantityInput.value);
  const currentActiveButtons = Array.from(optionButtons).filter((btn) => btn.classList.contains('active'));
  const totalSelections = Array.from(currentActiveButtons).reduce((total, btn) => total + parseInt(btn.dataset.clickCount), 0);

  if (event.detail && event.detail.longPress) {
    button.classList.remove('active');
    button.dataset.clickCount = 0;
  } else {
    if (!button.classList.contains('active')) {
      if (totalSelections < maxQuantity) {
        button.classList.add('active');
        button.dataset.clickCount = 1;
      }
    } else {
      const newCount = parseInt(button.dataset.clickCount) + 1;
      if (totalSelections + 1 <= maxQuantity) {
        button.dataset.clickCount = newCount;
      }
    }
  }

  // Check if option is Active-Req and validate selection
  if (button.required) {
    const activeAllowed = parseInt(button.dataset.activeAllowed);
    const activeMax = parseInt(button.dataset.activeMax);
    const activeMin = parseInt(button.dataset.activeMin);
    const currentSelections = Array.from(optionButtons).filter((btn) => btn.classList.contains('active')).length;

    console.log(`Validating selection for ${optionName} with Active-Allowed: ${activeAllowed}, Active-Max: ${activeMax}, Active-Min: ${activeMin}, Current Selections: ${currentSelections}`);

    if (currentSelections < activeMin || currentSelections > activeMax) {
      console.error(`Invalid selection for ${optionName}. Must select between ${activeMin} and ${activeMax} options.`);
      button.classList.remove('active');
      button.dataset.clickCount = 0;
    }
  }
}

// Fetch Unsplash image function
function fetchUnsplashImage(activeKindName, itemName) {
  return fetch(`https://api.unsplash.com/search/photos?query=${activeKindName}+${itemName}+food&orientation=squarish&content_filter=low&client_id=${unsplashAccessKey}`);
}

// Decrease quantity button event listener
decreaseButton.addEventListener('click', () => {
  const currentQuantity = parseInt(quantityInput.value);

  if (currentQuantity > 1) {
    quantityInput.value = currentQuantity - 1;
  }

  if (currentQuantity - 1 < previousQuantity) {
    document.querySelectorAll('.choice-btn.active').forEach((button) => {
      button.classList.remove('active');
      button.dataset.clickCount = 0; // Reset click count
    });
  }

  previousQuantity = parseInt(quantityInput.value); // Update previous quantity
});

// Increase quantity button event listener
increaseButton.addEventListener('click', () => {
  const currentQuantity = parseInt(quantityInput.value);
  quantityInput.value = currentQuantity + 1;
  previousQuantity = currentQuantity + 1; // Update previous quantity
});

// Reset modal function
function resetModal() {
  orderModalTitle.textContent = '';
  imgOrderBox.src = '';
  orderPrice.textContent = '';
  orderCoverName.textContent = '';
  document.getElementById('order-kind-name').textContent = '';
  document.getElementById('options-container').innerHTML = '';
  quantityInput.value = '1';

  document.querySelectorAll('.choice-btn.active').forEach((button) => {
    button.classList.remove('active');
    button.dataset.clickCount = 0;
  });
}

// Attach modal event listeners function
export function attachModalEventListeners(itemsHTML) {
  document.querySelectorAll('.item-box').forEach(itemBox => {
    itemBox.addEventListener('click', () => {
      const itemData = JSON.parse(itemBox.dataset.itemData);
      openModal(itemBox, itemData);
    });
  });

  document.getElementById('close-order-modal').addEventListener('click', () => {
    orderModal.classList.add('off');
    resetModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      orderModal.classList.add('off');
      resetModal();
    }
  });
}