/*
=============
Shopping Cart Management
=============
*/

const formatUGX = amount => new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
}).format(Math.round(Number(amount) || 0));

class ShoppingCart {
  constructor() {
    this.cart = this.getCartFromStorage();
  }

  // Get cart from localStorage
  getCartFromStorage() {
    const stored = localStorage.getItem('shoppingCart');
    return stored ? JSON.parse(stored) : [];
  }

  // Save cart to localStorage
  saveCartToStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
    this.updateCartUI();
  }

  // Add item to cart
  addToCart(product) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: product.quantity || 1
      });
    }
    
    this.saveCartToStorage();
    this.showNotification(`${product.title} added to cart!`);
  }

  // Remove item from cart
  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCartToStorage();
  }

  // Update item quantity
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCartToStorage();
      }
    }
  }

  // Get cart total
  getTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Get subtotal
  getSubtotal() {
    return this.getTotal();
  }

  // Get shipping cost
  getShipping() {
    const shippingCheckbox = document.querySelector('.check__shipping input');
    return shippingCheckbox && shippingCheckbox.checked ? 7000 : 0;
  }

  // Get total with shipping
  getTotalWithShipping() {
    return this.getTotal() + this.getShipping();
  }

  // Get cart count
  getCartCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  // Clear cart
  clearCart() {
    this.cart = [];
    this.saveCartToStorage();
  }

  // Update cart UI (cart badge and sidebar)
  updateCartUI() {
    const cartBadges = document.querySelectorAll('#cart__total');
    const count = this.getCartCount();
    cartBadges.forEach(badge => {
      badge.textContent = count;
    });
    
    // Update shopping cart sidebar
    this.updateShoppingCartSidebar();
    
    // If on cart page, update cart display
    if (document.querySelector('.cart__area')) {
      this.renderCartPage();
    }
  }

  // Update shopping cart sidebar (small cart dropdown)
  updateShoppingCartSidebar() {
    const shoppingCart = document.querySelector('.shopping-cart');
    if (!shoppingCart) return;

    shoppingCart.innerHTML = '';

    if (this.cart.length === 0) {
      shoppingCart.innerHTML = '<p style="padding: 20px; text-align: center;">Cart is empty</p>';
      return;
    }

    // Add items
    this.cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'box';
      div.innerHTML = `
        <a href="#" class="remove-from-sidebar" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </a>
        <img src="${item.image}" alt="${item.title}">
        <div class="content">
          <h3>${item.title}</h3>
          <span class="price">UGX ${formatUGX(item.price)}</span>
          <span class="quantity">qty : ${item.quantity}</span>
        </div>
      `;
      shoppingCart.appendChild(div);
    });

    // Add total and checkout button
    const total = document.createElement('div');
    total.className = 'total';
    total.textContent = `Total : UGX ${formatUGX(this.getTotalWithShipping())}`;
    shoppingCart.appendChild(total);

    const checkoutBtn = document.createElement('a');
    checkoutBtn.href = 'cart.html';
    checkoutBtn.className = 'btn';
    checkoutBtn.textContent = 'Check out';
    shoppingCart.appendChild(checkoutBtn);

    // Add remove event listeners
    document.querySelectorAll('.remove-from-sidebar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        this.removeFromCart(id);
      });
    });
  }

  // Render cart page
  renderCartPage() {
    const tbody = document.querySelector('.cart__table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (this.cart.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">Your cart is empty</td></tr>';
      this.updateCartTotals();
      return;
    }

    this.cart.forEach(item => {
      const row = document.createElement('tr');
      const subtotal = item.price * item.quantity;
      
      row.innerHTML = `
        <td class="product__thumbnail">
          <a href="#">
            <img src="${item.image}" alt="${item.title}">
          </a>
        </td>
        <td class="product__name">
          <a href="#">${item.title}</a>
        </td>
        <td class="product__price">
          <div class="price">
            <span class="new__price">UGX ${formatUGX(item.price)}</span>
          </div>
        </td>
        <td class="product__quantity">
          <div class="input-counter">
            <div>
              <span class="minus-btn" data-id="${item.id}">
                <svg>
                  <use xlink:href="./images/sprite.svg#icon-minus"></use>
                </svg>
              </span>
              <input type="text" min="1" value="${item.quantity}" max="10" class="counter-btn" data-id="${item.id}">
              <span class="plus-btn" data-id="${item.id}">
                <svg>
                  <use xlink:href="./images/sprite.svg#icon-plus"></use>
                </svg>
              </span>
            </div>
          </div>
        </td>
        <td class="product__subtotal">
          <div class="price">
            <span class="new__price">UGX ${formatUGX(subtotal)}</span>
          </div>
          <a href="#" class="remove__cart-item" data-id="${item.id}">
            <svg>
              <use xlink:href="./images/sprite.svg#icon-trash"></use>
            </svg>
          </a>
        </td>
      `;
      
      tbody.appendChild(row);
    });

    // Add event listeners
    this.addCartPageEventListeners();
    this.updateCartTotals();
  }

  // Add event listeners for cart page
  addCartPageEventListeners() {
    // Remove button
    document.querySelectorAll('.remove__cart-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        this.removeFromCart(id);
      });
    });

    // Plus button
    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        const input = document.querySelector(`.counter-btn[data-id="${id}"]`);
        const newQuantity = parseInt(input.value) + 1;
        if (newQuantity <= 10) {
          this.updateQuantity(id, newQuantity);
        }
      });
    });

    // Minus button
    document.querySelectorAll('.minus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        const input = document.querySelector(`.counter-btn[data-id="${id}"]`);
        const newQuantity = parseInt(input.value) - 1;
        if (newQuantity >= 1) {
          this.updateQuantity(id, newQuantity);
        }
      });
    });

    // Counter input
    document.querySelectorAll('.counter-btn').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = parseInt(input.dataset.id);
        let quantity = parseInt(input.value);
        if (isNaN(quantity) || quantity < 1) quantity = 1;
        if (quantity > 10) quantity = 10;
        input.value = quantity;
        this.updateQuantity(id, quantity);
      });
    });

    // Shipping checkbox
    const shippingCheckbox = document.querySelector('.check__shipping input');
    if (shippingCheckbox) {
      shippingCheckbox.addEventListener('change', () => {
        this.updateCartTotals();
      });
    }
  }

  // Update cart totals display
  updateCartTotals() {
    const subtotalSpan = document.querySelector('.cart__totals li:nth-child(1) span');
    const shippingSpan = document.querySelector('.cart__totals li:nth-child(2) span');
    const totalSpan = document.querySelector('.cart__totals li:nth-child(3) span');

    const subtotal = this.getSubtotal();
    const shipping = this.getShipping();
    const total = subtotal + shipping;

    if (subtotalSpan) subtotalSpan.textContent = `UGX ${formatUGX(subtotal)}`;
    if (shippingSpan) shippingSpan.textContent = `UGX ${formatUGX(shipping)}`;
    if (totalSpan) totalSpan.textContent = `UGX ${formatUGX(total)}`;
  }

  // Show notification
  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 9999;
      animation: slideIn 0.3s ease-in-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Checkout
  checkout(customerInfo) {
    if (this.cart.length === 0) {
      alert('Your cart is empty!');
      return false;
    }

    const order = {
      id: 'ORD-' + Date.now(),
      date: new Date().toLocaleString(),
      items: this.cart,
      subtotal: this.getSubtotal(),
      shipping: this.getShipping(),
      total: this.getTotalWithShipping(),
      customer: customerInfo,
      paymentMethod: customerInfo.paymentMethod || 'pending'
    };

    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Show confirmation
    alert(`Order placed successfully!\nOrder ID: ${order.id}\nPayment Method: ${customerInfo.paymentMethod}\nTotal: UGX ${formatUGX(order.total)}`);

    // Prevent popup from showing after order redirect
    localStorage.setItem('popupClosed', 'true');

    // Clear cart
    this.clearCart();

    // Redirect to home
    window.location.href = 'index.html';

    return true;
  }
}

// Payment method handlers
const paymentMethods = {
  visa: {
    name: 'Visa',
    process: async () => {
      return await showCardForm('Visa, Mastercard');
    }
  },
  mastercard: {
    name: 'Mastercard',
    process: async () => {
      return await showCardForm('Visa, Mastercard');
    }
  },
  mtn: {
    name: 'MTN MoMo',
    process: async () => {
      return await showMobileMoneyForm('MTN MoMo', 'MTN MoMo');
    }
  },
  airtel: {
    name: 'Airtel Money',
    process: async () => {
      return await showMobileMoneyForm('Airtel Money', 'Airtel Money');
    }
  },
  cod: {
    name: 'Cash on Delivery',
    process: async () => {
      return {
        success: true,
        method: 'Cash on Delivery'
      };
    }
  }
};

// Card form for Visa/Mastercard
function showCardForm(cardType) {
  return new Promise((resolve) => {
    const cardNumber = prompt(`Enter ${cardType} card number (16 digits):`);
    if (!cardNumber) {
      resolve({ success: false });
      return;
    }

    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      alert('Invalid card number format');
      resolve({ success: false });
      return;
    }

    const expiry = prompt('Enter expiry date (MM/YY):');
    if (!expiry) {
      resolve({ success: false });
      return;
    }

    const cvv = prompt('Enter CVV (3 digits):');
    if (!cvv || !/^\d{3}$/.test(cvv)) {
      alert('Invalid CVV');
      resolve({ success: false });
      return;
    }

    resolve({
      success: true,
      method: cardType,
      cardLast4: cardNumber.slice(-4)
    });
  });
}

// Mobile money form for MTN MoMo / Airtel Money
function showMobileMoneyForm(paymentType, displayName) {
  return new Promise((resolve) => {
    const phone = prompt(`Enter ${paymentType} phone number (format: 256...):`);
    if (!phone) {
      resolve({ success: false });
      return;
    }

    if (!/^256\d{9}$/.test(phone.replace(/\s/g, ''))) {
      alert('Invalid phone number format. Use format: 256...');
      resolve({ success: false });
      return;
    }

    alert(`Please enter your ${paymentType} PIN on your phone to confirm payment.`);

    resolve({
      success: true,
      method: displayName,
      phone: phone
    });
  });
}

const shop = new ShoppingCart();

// Add to cart button handler
document.addEventListener('DOMContentLoaded', () => {
  // Initial cart UI update
  shop.updateCartUI();

  // If on cart page, render it
  if (document.querySelector('.cart__area')) {
    shop.renderCartPage();
  }

  // Handle add to cart buttons
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('product__btn')) return;

    e.preventDefault();
    
    // Navigate up to find product container
    const productCard = e.target.closest('.product') || 
                        e.target.closest('.glide__slide') || 
                        e.target.closest('[class*="product"]');
    
    if (!productCard) return;

    // Try to get product data from the card
    const titleEl = productCard.querySelector('.product__title, h3, .product__name, .product__footer h3');
    const title = titleEl?.textContent?.trim() || 'Product';
    
    const priceEl = productCard.querySelector('.product__price h4, .product__price, .price, .new__price, [class*="price"]');
    const priceText = priceEl?.textContent || '0';
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    
    const imgEl = productCard.querySelector('img');
    const image = imgEl?.src || imgEl?.getAttribute('src') || './images/placeholder.png';
    
    const id = parseInt(productCard.dataset.id) || Math.floor(Math.random() * 10000);

    if (!isNaN(price) && price > 0) {
      shop.addToCart({
        id,
        title,
        price,
        image
      });
    } else {
      console.warn('Could not parse product price', priceText);
    }
  });

  // Handle checkout button on cart page
  const checkoutLink = document.querySelector('.proceed-checkout-btn');
  if (checkoutLink) {
    checkoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      
      if (shop.cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      // Collect customer info
      const name = prompt('Enter your full name:');
      if (!name) return;

      const email = prompt('Enter your email:');
      if (!email) return;

      const phone = prompt('Enter your phone number:');
      if (!phone) return;

      const address = prompt('Enter your address:');
      if (!address) return;

      // Show payment method modal
      const modal = document.getElementById('paymentModal');
      if (!modal) {
        alert('Payment modal not found. Please contact support.');
        return;
      }

      modal.style.display = 'flex';
      modal.classList.add('active');

      // Remove old listeners by cloning and replacing
      const paymentBtns = modal.querySelectorAll('.payment-btn');
      let paymentProcessing = false;

      const handlePaymentClick = async function(e) {
        e.preventDefault();
        if (paymentProcessing) return;
        paymentProcessing = true;

        const method = this.dataset.method;
        const methodHandler = paymentMethods[method];
        
        if (methodHandler) {
          const result = await methodHandler.process();
          
          if (result.success) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            shop.checkout({
              name,
              email,
              phone,
              address,
              paymentMethod: result.method
            });
          } else {
            alert('Payment cancelled. Please try again.');
            paymentProcessing = false;
          }
        }
      };

      // Attach click listeners to all payment buttons
      paymentBtns.forEach(btn => {
        btn.removeEventListener('click', handlePaymentClick);
        btn.addEventListener('click', handlePaymentClick);
      });

      // Close modal button
      const closeBtn = document.getElementById('closePaymentModal');
      if (closeBtn) {
        closeBtn.onclick = function(e) {
          e.preventDefault();
          modal.style.display = 'none';
          modal.classList.remove('active');
          paymentProcessing = false;
        };
      }
    });
  }
});

// Add CSS animation for notification
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
