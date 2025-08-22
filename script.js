// ===== Navigation =====
const hamb = document.getElementById('hamb');
const nav = document.getElementById('navlinks');
const navLinks = document.querySelectorAll('nav a');

if (hamb && nav) {
  hamb.addEventListener('click', () => {
    nav.classList.toggle('active');
    hamb.classList.toggle('open');

    // Change hamburger icon
    hamb.innerHTML = hamb.classList.contains('open') ? '✕' : '☰';
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (nav.classList.contains('active')) {
      nav.classList.remove('active');
      hamb.classList.remove('open');
      hamb.innerHTML = '☰';
    }
  });
});

// Header scroll effect
window.addEventListener('scroll', function () {
  const header = document.getElementById('header');
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// ===== Year in Footer =====
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ===== Cart Count in Header =====
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const countEl = document.querySelector('.cart-count');
  if (countEl) countEl.textContent = totalItems;
}
updateCartCount();

const cartIcon = document.querySelector('.cart-icon');
if (cartIcon) {
  cartIcon.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });
}

// ===== Add-to-Cart (Menu Page) =====
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function () {
    const name = this.getAttribute('data-name');
    const price = parseFloat(this.getAttribute('data-price'));

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showCartNotification(`${name} added to cart!`);
  });
});

function showCartNotification(message) {
  const cartNotification = document.getElementById('cartNotification');
  if (!cartNotification) return;
  cartNotification.textContent = message;
  cartNotification.classList.add('show');

  setTimeout(() => {
    cartNotification.classList.remove('show');
  }, 3000);
}

// ===== Cart Page (cart.html) =====
if (document.querySelector('.cart-container')) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalElement = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const paymentMethods = document.querySelectorAll('.payment-method');
  const paymentDetails = document.getElementById('paymentDetails');
  let selectedPaymentMethod = '';

  const paymentTemplates = {
    upi: `<div class="form-group"><label for="upiId">UPI ID</label><input type="text" id="upiId" placeholder="yourname@upi" required></div>`,
    credit: `<div class="form-group"><label for="cardNumber">Card Number</label><input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required></div>
             <div class="form-group"><label for="cardName">Name on Card</label><input type="text" id="cardName" placeholder="John Doe" required></div>
             <div class="form-group"><label for="expiry">Expiry Date</label><input type="text" id="expiry" placeholder="MM/YY" required></div>
             <div class="form-group"><label for="cvv">CVV</label><input type="text" id="cvv" placeholder="123" required></div>`,
    debit: `<div class="form-group"><label for="debitCardNumber">Card Number</label><input type="text" id="debitCardNumber" placeholder="1234 5678 9012 3456" required></div>
            <div class="form-group"><label for="debitCardName">Name on Card</label><input type="text" id="debitCardName" placeholder="John Doe" required></div>
            <div class="form-group"><label for="debitExpiry">Expiry Date</label><input type="text" id="debitExpiry" placeholder="MM/YY" required></div>
            <div class="form-group"><label for="debitCvv">CVV</label><input type="text" id="debitCvv" placeholder="123" required></div>`,
    netbanking: `<div class="form-group"><label for="bank">Select Bank</label><select id="bank" required>
                  <option value="">Select your bank</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                </select></div>`
  };

  function updateCart() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      cartTotalElement.textContent = '0.00';
      return;
    }

    let total = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item';
      cartItemElement.innerHTML = `
        <div class="cart-item-name">${item.name} x${item.quantity}</div>
        <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
        <button class="cart-item-remove" data-index="${index}">Remove</button>
      `;

      cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotalElement.textContent = total.toFixed(2);

    document.querySelectorAll('.cart-item-remove').forEach(button => {
      button.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        updateCartCount();
      });
    });
  }

  updateCart();

  paymentMethods.forEach(method => {
    method.addEventListener('click', function () {
      paymentMethods.forEach(m => m.classList.remove('selected'));
      this.classList.add('selected');
      selectedPaymentMethod = this.getAttribute('data-method');
      paymentDetails.innerHTML = paymentTemplates[selectedPaymentMethod] || '';
      paymentDetails.classList.add('active');
    });
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      const name = document.getElementById('customerName').value.trim();
      const phone = document.getElementById('customerPhone').value.trim();
      const address = document.getElementById('customerAddress').value.trim();

      if (!name || !phone || !address) {
        alert('Please fill all customer details');
        return;
      }

      if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
      }

      alert(`Thank you for your order, ${name}! We will contact you at ${phone} to confirm.`);
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
      updateCartCount();
      paymentDetails.innerHTML = '';
      paymentDetails.classList.remove('active');
      selectedPaymentMethod = '';
      document.getElementById('customerName').value = '';
      document.getElementById('customerPhone').value = '';
      document.getElementById('customerAddress').value = '';
      paymentMethods.forEach(m => m.classList.remove('selected'));
    });
  }
}
document.querySelectorAll(".read-more").forEach(button => {
  button.addEventListener("click", () => {
    const article = button.closest(".blog-post");
    const fullText = article.querySelector(".full-text");
    const shortText = article.querySelector(".short-text");

    if (fullText.classList.contains("hidden")) {
      fullText.classList.remove("hidden");
      shortText.style.display = "none";
      button.textContent = "Read Less";
    } else {
      fullText.classList.add("hidden");
      shortText.style.display = "block";
      button.textContent = "Read More";
    }
  });
});