// ─── Central Add to Cart ──────────────────────────────────────────────────────
window.addToCart = function (variantId, quantity, btn) {
  if (btn) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Adding…';
  }

  return fetch('/cart/add.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: quantity || 1 })
  })
    .then(res => res.json())
    .then(data => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || 'Add to cart';
      }
      showToast(`${data.product_title} added to cart`, 'success');
      updateCartDrawer();
      return data;
    })
    .catch(err => {
      console.error('Add to cart error:', err);
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || 'Add to cart';
      }
    });
};
document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[name="add"]');
    if (!btn) return;

    // product-card__button হলে skip করো — ProductCard._onClick সেটা handle করবে
    if (btn.classList.contains('product-card__button')) return;

    const form = btn.closest('.product-form');
    if (!form) return;

    e.preventDefault();

    const variantId = form.querySelector('[name="id"]')?.value;
    const quantity = form.querySelector('[name="quantity"]')?.value || 1;

    if (!variantId) return;

    window.addToCart(variantId, quantity, btn);
  });
});

function updateCartDrawer() {
  fetch('/cart.json')
    .then((res) => res.json())
    .then((cart) => {
      updateBadge(cart.item_count);
      renderDrawerItems(cart);
      openCartDrawer();
    })
    .catch((err) => console.error('Cart update error:', err));
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function updateBadge(count) {
  const badge = document.querySelector('.site-header__cart-count');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

// ─── Drawer Open ──────────────────────────────────────────────────────────────

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.setAttribute('aria-hidden', 'false');
}

// ─── Render Items ─────────────────────────────────────────────────────────────

function renderDrawerItems(cart) {
  const drawerBody = document.querySelector('.cart-drawer__body');
  const subtotalEl = document.querySelector('.cart-drawer__subtotal span:last-child');

  if (subtotalEl) {
    subtotalEl.textContent = formatMoney(cart.total_price);
  }

  if (!drawerBody) return;

  if (cart.item_count === 0) {
    drawerBody.innerHTML = `<p class="cart-drawer__empty">Your cart is empty</p>`;
    return;
  }

  const itemsHTML = cart.items
    .map(
      (item) => `
  <li class="cart-drawer__item" data-key="${item.key}">
      
       <div class="cart-drawer__loader hidden">
    <div class="spinner"></div>
  </div> 
     
    <div class="cart-drawer__item-image">
      <img src="${item.image}" alt="${item.product_title}" width="80" height="80" loading="lazy">
    </div>

    <div class="cart-drawer__item-content">

      <div class="cart-drawer__item-top">
        <a href="${item.url}" class="cart-drawer__item-title">${item.product_title}</a>
        <button 
          class="cart-drawer__item-remove" 
          data-key="${item.key}"
          aria-label="Remove ${item.product_title}"
        >&times;</button>
      </div>

      ${item.variant_title && item.variant_title !== 'Default Title'
          ? `<p class="cart-drawer__item-variant">${item.variant_title}</p>`
          : ''
        }

      <div class="cart-drawer__item-bottom">
        <div class="cart-drawer__qty">
          <button class="cart-drawer__qty-btn" data-key="${item.key}" data-action="decrease">−</button>
          <span class="cart-drawer__qty-value">${item.quantity}</span>
          <button class="cart-drawer__qty-btn" data-key="${item.key}" data-action="increase">+</button>
        </div>
        <p class="cart-drawer__item-price">${formatMoney(item.final_line_price)}</p>
      </div>

    </div>
  </li>
  `
    )
    .join('');

  drawerBody.innerHTML = `<ul class="cart-drawer__items" role="list">${itemsHTML}</ul>`;

  // Event listeners লাগাবো নতুন HTML এ
  attachDrawerEvents();
}

// ─── Drawer Events (remove + quantity) ────────────────────────────────────────

function attachDrawerEvents() {
  // Remove button
  document.querySelectorAll('.cart-drawer__item-remove').forEach((btn) => {
    btn.addEventListener('click', function () {
    const key = this.dataset.key;

    disableItemControls(key, true);
    toggleItemLoader(key, true); // loader show

    updateCartItem(key, 0); // সরাসরি remove
  });
  });

  // Quantity buttons
  document.querySelectorAll('.cart-drawer__qty-btn').forEach((btn) => {
   btn.addEventListener('click', function () {
    const key = this.dataset.key;
    const action = this.dataset.action;

    disableItemControls(key, true);
    toggleItemLoader(key, true);

    const qtyEl = this.parentElement.querySelector('.cart-drawer__qty-value');
    let currentQty = parseInt(qtyEl.textContent);

    const newQty = action === 'increase' ? currentQty + 1 : currentQty - 1;

    if (newQty < 1) {
      updateCartItem(key, 0);
    } else {
      updateCartItem(key, newQty);
    }
  });
  });
}

// ─── Cart Item Update API ─────────────────────────────────────────────────────

function updateCartItem(key, quantity) {
  // 🔹 loader show
  toggleItemLoader(key, true);

  fetch('/cart/change.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ id: key, quantity: quantity }),
  })
    .then((res) => res.json())
    .then((cart) => {
      updateBadge(cart.item_count);
      renderDrawerItems(cart);

       if (quantity === 0) {
        showToast('Product removed from cart ❌', 'error');
      } else {
        showToast('Cart updated 🔄', 'success');
      }
    })
    .catch((err) => {
      console.error('Update error:', err);
    });
}

// ─── Format Money ─────────────────────────────────────────────────────────────

function formatMoney(cents) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: window.Shopify?.currency?.active || 'USD',
  });
}

// Page load এ cart drawer টা JS দিয়ে render করো
document.addEventListener('DOMContentLoaded', function () {
  fetch('/cart.json')
    .then((res) => res.json())
    .then((cart) => {
      updateBadge(cart.item_count);
      renderDrawerItems(cart);
    })
    .catch((err) => console.error('Initial cart load error:', err));
});

// --------------4/12/2026----------------------------------

function toggleItemLoader(key, show) {
  const item = document.querySelector(`.cart-drawer__item[data-key="${key}"]`);
  if (!item) return;

  const loader = item.querySelector('.cart-drawer__loader');
  if (!loader) return;

  loader.classList.toggle('hidden', !show);
}

function disableItemControls(key, disabled) {
  const item = document.querySelector(`.cart-drawer__item[data-key="${key}"]`);
  if (!item) return;

  item.querySelectorAll('button').forEach(btn => {
    btn.disabled = disabled;
  });
}

// ─── Toast Message ─────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // show animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 50);

  // remove after 3 sec
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}