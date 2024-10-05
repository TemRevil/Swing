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
let baseItemPrice = 0;

function updateModalContent(itemName, itemImgSrc, itemPrice, activeKindName) {
  orderModalTitle.textContent = itemName;
  imgOrderBox.src = itemImgSrc;
  baseItemPrice = parseFloat(itemPrice) || 0; // Ensure baseItemPrice is a number
  orderPrice.innerHTML = `${baseItemPrice} <span id="currency">EGP</span>`;
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

  // Check if Active-Req is "Yes" and add the "REQUIRED" label
  if (option['Active-Settings'] && option['Active-Settings']['Active-Req'] === 'Yes') {
    const requiredSpan = document.createElement('span');
    requiredSpan.className = 'req';
    requiredSpan.textContent = ' REQUIRED'; // Adding space before text for separation
    optionLabel.appendChild(requiredSpan);
  }

  optionsContainer.appendChild(optionLabel);

  const optionButtonsContainer = document.createElement('div');
  optionButtonsContainer.className = 'flex row wrap gap';
  optionButtonsContainer.dataset.optionName = optionName;
  optionButtonsContainer.dataset.attendToQuantity = option['Active-Settings'] && option['Active-Settings']['Attend-to-Quantity'];

  // Set the data attributes on the optionButtonsContainer
  optionButtonsContainer.dataset.activeMinCounts = option['Active-Settings'] && option['Active-Settings']['Active-Min-Counts']; // Updated
  optionButtonsContainer.dataset.activeMax = option['Active-Settings'] && option['Active-Settings']['Active-Max'];
  optionButtonsContainer.dataset.activeMin = option['Active-Settings'] && option['Active-Settings']['Active-Min'];
  optionButtonsContainer.dataset.activeReq = option['Active-Settings'] && option['Active-Settings']['Active-Req']; // Get the "Active-Req" value from Firebase
  optionButtonsContainer.dataset.activeCounts = option['Active-Settings'] && option['Active-Settings']['Active-Counts'];

  // Sort the option values before rendering them
  const sortedOptionValues = Object.keys(option).filter((optionValue) => {
    return !['Active-Settings'].includes(optionValue);
  }).sort((a, b) => {
    if (optionName === 'Size') {
      const sizeOrder = ['Single', 'Double', 'Triple'];
      return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
    } else {
      return a.localeCompare(b);
    }
  });

  sortedOptionValues.forEach((optionValue) => {
    const optionButton = document.createElement('button');
    optionButton.className = 'choice-btn text';
    optionButton.textContent = optionValue;
    optionButton.dataset.price = parseFloat(option[optionValue].Price) || 0; // Ensure price is a number
    optionButtonsContainer.appendChild(optionButton);
  });

  optionsContainer.appendChild(optionButtonsContainer);
}

// Attach event listeners to buttons function
function attachEventListenersToButtons(optionsContainer) {
  document.querySelectorAll('.choice-btn').forEach((button) => {
    let longPressTimeout;

    // Handle long press event
    button.addEventListener('mousedown', () => {
      longPressTimeout = setTimeout(() => {
        longPressTimeout = null;
        const longPressEvent = new CustomEvent('longPress');
        button.dispatchEvent(longPressEvent);
      }, 1000); // Long press duration is 1 second
    });

    button.addEventListener('mouseup', () => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        longPressTimeout = null;
      }
    });

    // Handle normal click event
    button.addEventListener('click', (event) => {
      if (longPressTimeout) {
        event.detail = { longPress: true };
      }
      toggleActiveClass(event, optionsContainer);
      updateOrderPrice(); // Update price after each click
    });

    // Handle long press event
    button.addEventListener('longPress', (event) => {
      toggleActiveClass({ target: button, detail: { longPress: true } }, optionsContainer);
      updateOrderPrice(); // Update price after long press
    });
  });

  // Create a MutationObserver to observe changes in the choice buttons
  const observer = new MutationObserver(() => {
    updateOrderPrice(); // Update price whenever there's a change in the class or dataset
  });

  // Observe changes in all choice buttons
  document.querySelectorAll('.choice-btn').forEach((button) => {
    observer.observe(button, {
      attributes: true, // Watch for attribute changes
      attributeFilter: ['class', 'data-click-count'], // Specifically watch for class and data-click-count changes
    });
  });
}

// Update order price function with animation for both increase and decrease
function updateOrderPrice() {
  const activeChoices = document.querySelectorAll('.choice-btn.active');
  let totalOptionsPrice = 0;

  // Loop through active choices to calculate total options price
  activeChoices.forEach((choice) => {
    const price = parseFloat(choice.dataset.price); // Convert price to a float
    const clickCount = parseInt(choice.dataset.clickCount) || 1; // Ensure clickCount exists, default to 1

    if (!isNaN(price)) {
      totalOptionsPrice += price * clickCount; // Add price multiplied by click count
    }
  });

  const orderPrice = document.querySelector('#order-price'); // Correct ID reference
  if (!orderPrice) {
    console.error('Order price element not found');
    return;
  }

  const quantity = parseInt(quantityInput.value); // Get the current quantity
  const totalItemPrice = baseItemPrice * quantity; // Calculate the total item price
  const totalOrderPrice = totalItemPrice + totalOptionsPrice; // Calculate the total order price

  const startPrice = parseFloat(orderPrice.textContent.replace(/\D+/g, '')) || 0; // Remove non-digits to get current price
  const endPrice = totalOrderPrice;
  const duration = 500; // 0.5 seconds for the animation

  let startTime = null;

  if (endPrice > startPrice) {
    // If price increases
    orderPrice.style.color = 'var(--emerald)';
  } else if (endPrice < startPrice) {
    // If price decreases
    orderPrice.style.color = 'var(--poppy)';
  }

  // Animate the price change
  function animatePrice(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1); // Ensure progress doesn't exceed 1
    const currentPrice = startPrice + (endPrice - startPrice) * progress;

    orderPrice.innerHTML = `${Math.floor(currentPrice)} <span id="currency">EGP</span>`;

    if (progress < 1) {
      requestAnimationFrame(animatePrice); // Continue animation until complete
    } else {
      // Reset color after animation is complete
      orderPrice.style.color = '';
    }
  }

  requestAnimationFrame(animatePrice); // Start the price animation
}

// Toggle active class function
function toggleActiveClass(event, optionsContainer) {
  const button = event.target;
  const optionContainer = button.parentNode; // Get the main option container
  const optionName = optionContainer.dataset.optionName; // Use data-option-name to identify the option
  const optionButtons = optionContainer.querySelectorAll('button.choice-btn');
  const maxQuantity = parseInt(quantityInput.value); // Get the value of #order-quantity
  const activeCounts = parseInt(optionContainer.dataset.activeCounts); // Get Active-Counts for this option
  const currentActiveButtons = Array.from(optionButtons).filter((btn) => btn.classList.contains('active'));
  const totalSelections = Array.from(currentActiveButtons).reduce((total, btn) => total + parseInt(btn.dataset.clickCount), 0); // Sum up the click counts
  const attendToQuantity = optionContainer.dataset.attendToQuantity;

  // Handle cases where Active-Counts is set to "N" or "-"
  if (optionContainer.dataset.activeCounts === "N" || optionContainer.dataset.activeCounts === "-") {
    return; // Skip processing if the Active-Counts is not relevant
  }

  // Log Active-Counts and calculated selection limit
  console.log(`${optionName} - Active-Counts: ${activeCounts}, Selection Limit: ${activeCounts * maxQuantity}`);

  if (event.detail && event.detail.longPress) {
    // If it's a long press, reset the button state
    button.classList.remove('active');
    button.dataset.clickCount = 0;
  } else {
    // If the button is not active
    if (!button.classList.contains('active')) {
      // If the total selections are within the limit
      if (attendToQuantity === 'Yes' && totalSelections >= activeCounts * maxQuantity) {
        // Do nothing if the selection exceeds the limit
      } else {
        // Activate the button and set the click count to 1
        button.classList.add('active');
        button.dataset.clickCount = 1;
      }
    } else {
      // Increment the click count if already active
      const newCount = parseInt(button.dataset.clickCount) + 1;
      if (attendToQuantity === 'Yes' && totalSelections + 1 > activeCounts * maxQuantity) {
        // Prevent exceeding the selection limit
      } else {
        // Update the click count
        button.dataset.clickCount = newCount;
      }
    }
  }

  // If the option is required, validate the selection
  if (optionContainer.dataset.activeReq === 'Yes') {
    const activeMinCounts = parseInt(optionContainer.dataset.activeMinCounts); // Get the minimum counts
    const activeMax = optionContainer.dataset.activeMax === 'N' ? Infinity : parseInt(optionContainer.dataset.activeMax); // Handle unlimited max
    const activeMin = parseInt(optionContainer.dataset.activeMin); // Get the minimum allowed selections
    const currentSelections = Array.from(optionButtons).filter((btn) => btn.classList.contains('active')).length;

    // Check if the selection is within the allowed range
    if (currentSelections < activeMin || currentSelections > activeMax) {
      console.error(`Invalid selection for ${optionName}. Must select between ${activeMin} and ${activeMax} options.`);
      button.classList.remove('active'); // Deactivate if invalid
      button.dataset.clickCount = 0;
    }
  }
}

// Custom function for checking when the "Add" button is clicked
document.getElementById('add-order').addEventListener('click', function() {
  const optionGroups = document.querySelectorAll('.flex.row.wrap.gap');
  const orderQuantity = parseInt(quantityInput.value);
  let isValid = true;

  optionGroups.forEach(optionGroup => {
    const optionButtons = optionGroup.querySelectorAll('.choice-btn');
    const optionName = optionGroup.previousElementSibling.textContent;
    const activeReq = optionGroup.dataset.activeReq === 'Yes';
    let activeMin = parseInt(optionGroup.dataset.activeMin);
    let activeMax = parseInt(optionGroup.dataset.activeMax);
    let activeMinCounts = parseInt(optionGroup.dataset.activeMinCounts);
    let activeCounts = parseInt(optionGroup.dataset.activeCounts) || 0;

    if (optionGroup.dataset.activeMin === "N" || optionGroup.dataset.activeMin === "-") {
      activeMin = 0;
    }
    if (optionGroup.dataset.activeMax === "N" || optionGroup.dataset.activeMax === "-") {
      activeMax = Infinity;
    }
    if (optionGroup.dataset.activeMinCounts === "N" || optionGroup.dataset.activeMinCounts === "-") {
      activeMinCounts = 0;
    }

    const requiredActiveCounts = activeCounts * orderQuantity;
    let activeButtonsCount = 0;

    optionButtons.forEach(button => {
      const clickCount = parseInt(button.dataset.clickCount) || 0;
      if (clickCount > 0) {
        activeButtonsCount += clickCount;
      }
    });

    if (!activeReq && activeButtonsCount === 0) {
      return;
    }

    if (activeMin > 0 && activeButtonsCount < activeMin) {
      showAlert(`Please select at least ${activeMin} options for ${optionName}.`, true);
      isValid = false;
    }

    if (activeMax > 0 && activeButtonsCount > activeMax) {
      showAlert(`Please don't select more than ${activeMax} options for ${optionName}.`, true);
      isValid = false;
    }

    if (activeReq && activeButtonsCount !== requiredActiveCounts) {
      showAlert(`Please select exactly ${requiredActiveCounts} options for ${optionName}.`, true);
      isValid = false;
    }

    if (activeMinCounts > 0 && activeButtonsCount < activeMinCounts) {
      showAlert(`Please select at least ${activeMinCounts} choices for ${optionName}.`, true);
      isValid = false;
    }
  });

  if (isValid) {
    const itemName = orderModalTitle.textContent;
    const itemImgSrc = document.querySelector('#img-order-box img').src;
    const itemPrice = orderPrice.textContent.replace(/\D+/g, '');
    const quantity = parseInt(quantityInput.value);

    const selectedOptions = [];
    optionGroups.forEach(optionGroup => {
      const optionButtons = optionGroup.querySelectorAll('.choice-btn');
      optionButtons.forEach(button => {
        const clickCount = parseInt(button.dataset.clickCount) || 0;
        if (clickCount > 0) {
          selectedOptions.push({ name: button.textContent, count: clickCount });
        }
      });
    });

    const receiptItem = document.createElement('div');
    receiptItem.className = 'item-receipt flex row gap';

    const receiptItemWrapper = document.createElement('div');
    receiptItemWrapper.className = 'xr-731 flex row gap';
    receiptItem.appendChild(receiptItemWrapper);

    const receiptItemImage = document.createElement('img');
    receiptItemImage.src = itemImgSrc;
    receiptItemImage.alt = 'Item Image';
    receiptItemImage.id = 'item-receipt-img';
    receiptItemWrapper.appendChild(receiptItemImage);

    const receiptItemDetails = document.createElement('div');
    receiptItemDetails.className = 'w flex col';
    receiptItemWrapper.appendChild(receiptItemDetails);

    const receiptItemNameAndPrice = document.createElement('div');
    receiptItemNameAndPrice.className = 'w flex row center between';
    receiptItemDetails.appendChild(receiptItemNameAndPrice);

    const receiptItemName = document.createElement('p');
    receiptItemName.id = 'item-receipt-name';
    receiptItemName.className = 'text';
    receiptItemName.textContent = itemName;
    receiptItemNameAndPrice.appendChild(receiptItemName);

    const receiptItemPrice = document.createElement('span');
    receiptItemPrice.id = 'item-receipt-price';
    receiptItemPrice.className = 'text';
    receiptItemPrice.innerHTML = `${itemPrice} <span id="currency">EGP</span>`;
    receiptItemNameAndPrice.appendChild(receiptItemPrice);

    const receiptItemOptions = document.createElement('div');
    receiptItemOptions.id = 'item-receipt-options';
    receiptItemOptions.className = 'text';
    
    const maxVisibleOptions = 2;
    selectedOptions.forEach((option, index) => {
      if (index < maxVisibleOptions) {
        const optionText = document.createElement('span');
        optionText.innerHTML = `<span>${option.count}x</span> ${option.name}`;
        optionText.dataset.optionName = option.name; // Add data-option-name attribute
        optionText.dataset.optionCount = option.count; // Add data-option-count attribute
        receiptItemOptions.appendChild(optionText);
        receiptItemOptions.appendChild(document.createElement('br'));
      }
    });
    
    if (selectedOptions.length > maxVisibleOptions) {
      const moreOptions = document.createElement('span');
      moreOptions.textContent = `${selectedOptions.length - maxVisibleOptions} more`;
      receiptItemOptions.appendChild(moreOptions);
    }

    receiptItemDetails.appendChild(receiptItemOptions);

    const receiptItemComment = document.createElement('div');
    receiptItemComment.id = 'item-receipt-comment';
    receiptItemComment.className = 'w xs-732 text';
    receiptItemComment.textContent = document.getElementById('order-comment').value; // Use the comment from #order-comment
    receiptItemDetails.appendChild(receiptItemComment);

    const deleteButton = document.createElement('button');
    deleteButton.id = 'delete-order';
    deleteButton.innerHTML = '<img src="Backround/Icons/Trash.png" alt="Delete-Order">';
    receiptItem.appendChild(deleteButton);

    // Add the receipt item to the receipt
    const receiptInfo = document.querySelector('.receipt-info');
    receiptInfo.appendChild(receiptItem);

    // Close the modal and reset it
    const modal = document.querySelector('.order-modal');
    modal.classList.add('off');
    resetModal();

    showAlert('Order added successfully!', false);
  }
});

function ReceiptOptions() {
  // Get the order list element
  const orderList = document.getElementById('order-list');

  // Check if the order list element exists before adding event listeners
  if (orderList) {
    // Add event listener to the order list element
    orderList.addEventListener('click', function(event) {
      // Check if the clicked element is the delete button
      if (event.target.closest('#delete-order')) {
        // Get the closest item receipt element
        const itemReceipt = event.target.closest('.item-receipt');
        
        // If the item receipt element is found, remove it
        if (itemReceipt) {
          itemReceipt.remove();
        }
      }
    });

    // Add event listener for decrease button
    document.addEventListener('click', function(event) {
      if (event.target.closest('#item-receipt-decrease')) {
        const itemReceipt = event.target.closest('.item-receipt');
        const quantityElement = itemReceipt.querySelector('#item-receipt-quantity');
        const priceElement = itemReceipt.querySelector('#item-receipt-price');
        let currentQuantity = parseInt(quantityElement.textContent);
        let currentPrice = parseFloat(priceElement.textContent.replace(/[^\d\.]/g, ''));

        // Ensure quantity is not less than 1
        if (currentQuantity > 1) {
          const originalPrice = currentPrice / currentQuantity;
          currentQuantity--;
          quantityElement.textContent = currentQuantity.toString();
          priceElement.textContent = originalPrice * currentQuantity + ' EGP';
        } else {
          // If quantity is 1, keep the original price
          priceElement.textContent = currentPrice + ' EGP';
        }
      }
    });

    // Add event listener for increase button
    document.addEventListener('click', function(event) {
      if (event.target.closest('#item-receipt-increase')) {
        const itemReceipt = event.target.closest('.item-receipt');
        const quantityElement = itemReceipt.querySelector('#item-receipt-quantity');
        const priceElement = itemReceipt.querySelector('#item-receipt-price');
        let currentQuantity = parseInt(quantityElement.textContent);
        let currentPrice = parseFloat(priceElement.textContent.replace(/[^\d\.]/g, ''));

        // Increase quantity by 1
        const originalPrice = currentPrice / currentQuantity;
        currentQuantity++;
        quantityElement.textContent = currentQuantity.toString();
        priceElement.textContent = originalPrice * currentQuantity + ' EGP';
      }
    });
  } else {
    console.error('Order list element not found in the DOM.');
  }
}

// Call the ReceiptOptions function
ReceiptOptions();

document.getElementById('order-list').addEventListener('click', async (event) => {
  const itemReceipt = event.target.closest('.item-receipt');
  if (itemReceipt) {
    const itemName = itemReceipt.querySelector('#item-receipt-name').textContent.trim();
    const itemOptionsElement = itemReceipt.querySelector('#item-receipt-options');
    const itemOptions = Array.from(itemOptionsElement.children)
                             .map(option => ({
                               name: option.getAttribute('data-option-name'),
                               count: option.getAttribute('data-option-count')
                             }))
                             .filter(option => option.name) // استبعاد العناصر التي لا تحتوي على خاصية data-option-name
                             .map(option => ({
                               name: option.name.trim(),
                               count: option.count ? parseInt(option.count.trim()) : 1
                             }));
    const itemComment = itemReceipt.querySelector('#item-receipt-comment').textContent.trim();

    console.log(`Item name: ${itemName}`);
    console.log(`Options: ${itemOptions.map(option => option.name)}`);
    console.log(`Comment: ${itemComment}`);

    const itemFound = Array.from(document.querySelectorAll('.item-box')).find(itemBox => {
      return itemBox.querySelector('p#item-name').textContent.trim() === itemName;
    });

    if (itemFound) {
      console.log(`Item "${itemName}" found in main menu!`);
      await openModal(itemFound, getItemData(itemFound));

      // ضبط التعليق في الـ modal
      const modalComment = document.querySelector('#order-comment');
      modalComment.value = itemComment;

      // تحديد الخيارات السابقة في الـ modal
      itemOptions.forEach(option => {
        const optionButton = Array.from(document.querySelectorAll('.choice-btn')).find(btn => btn.textContent.trim() === option.name);
        if (optionButton) {
          optionButton.classList.add('active');
          optionButton.setAttribute('data-click-count', option.count);
        }
      });

    } else {
      console.log(`Item "${itemName}" not found in main menu.`);
    }
  }
});

// Assuming you have a function to get item data from the itemBox
function getItemData(itemBox) {
  const itemData = JSON.parse(itemBox.getAttribute('data-item-data'));
  const options = itemData.options;

  return { options };
}

// Function to show an alert in the specified div
function showAlert(message, isError) {
  const alertDiv = document.querySelector('.alert');
  const alertMessage = document.getElementById('alert');
  const alertIcon = document.querySelector('.alert-icon');

  // Remove any existing icon elements
  while (alertIcon.firstChild) {
    alertIcon.removeChild(alertIcon.firstChild);
  }

  alertMessage.textContent = message;
  alertDiv.classList.remove('off');

  // Create the icon element dynamically
  let iconElement;
  if (isError) {
    iconElement = document.createElement('i');
    iconElement.className = 'fa-solid fa-circle-xmark';
  } else {
    iconElement = document.createElement('i');
    iconElement.className = 'fa-solid fa-check';
  }
  alertIcon.appendChild(iconElement);

  if (isError) {
    alertDiv.style.backgroundColor = 'var(--poppy)';
  } else {
    alertDiv.style.backgroundColor = 'var(--chartreuse)';
  }

  // Add event listener for closing the alert
  alertDiv.addEventListener('click', function() {
    alertDiv.classList.add('off');
    // Remove the icon element when the alert is closed
    while (alertIcon.firstChild) {
      alertIcon.removeChild(alertIcon.firstChild);
    }
    alertMessage.textContent = '';
  });

  setTimeout(() => {
    alertDiv.classList.add('off');
    // Remove the icon element when the alert is closed
    while (alertIcon.firstChild) {
      alertIcon.removeChild(alertIcon.firstChild);
    }
    alertMessage.textContent = '';
  }, 5000);
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

    // Update previous quantity
    previousQuantity = parseInt(quantityInput.value);
    
    // Remove active classes from all choice buttons
    document.querySelectorAll('.choice-btn').forEach((button) => {
      button.classList.remove('active');
      button.dataset.clickCount = 0; // Reset click count
    });

    // Update the item price based on the new quantity
    updateItemPrice();
  }
});

// Increase quantity button event listener
increaseButton.addEventListener('click', () => {
  const currentQuantity = parseInt(quantityInput.value);
  quantityInput.value = currentQuantity + 1;

  // Update previous quantity
  previousQuantity = currentQuantity + 1;
  // Update the item price based on the new quantity
  updateItemPrice();
});

// Function to update item price based on current quantity
function updateItemPrice() {
  const currentQuantity = parseInt(quantityInput.value);
  const totalItemPrice = baseItemPrice * currentQuantity;

  // Update the total price with additional options if applicable
  updateOrderPrice();
}

// Reset modal function
function resetModal() {
  // Clear all elements
  orderModalTitle.textContent = '';
  imgOrderBox.src = '';
  orderPrice.textContent = '';
  orderCoverName.textContent = '';
  document.getElementById('order-kind-name').textContent = '';
  document.getElementById('options-container').innerHTML = '';
  quantityInput.value = '1';
  
  // Clear comments
  document.getElementById('order-comment').value = '';

  // Reset buttons
  document.querySelectorAll('.choice-btn').forEach((button) => {
    button.classList.remove('active');
    button.dataset.clickCount = 0; // Reset click count
  });

  // Reset previous quantity
  previousQuantity = 1;

  // Hide the modal
  const modal = document.querySelector('.order-modal');
  modal.classList.add('off');
}

// Close modal event listener
document.addEventListener('DOMContentLoaded', function() {
  const closeButton = document.getElementById('close-order-modal');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      // ضع هنا الكود الخاص بك لإغلاق المودال أو العنصر
      console.log('Close button clicked!');
    });
  } else {
    console.error('Close button not found!');
  }
});

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