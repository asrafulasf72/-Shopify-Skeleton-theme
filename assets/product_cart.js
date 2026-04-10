document.addEventListener('DOMContentLoaded', function (){
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    if(!addToCartBtn) return;

    addToCartBtn.addEventListener('click', function(e){
        e.preventDefault();

        const form = addToCartBtn.closest('form');
        const formData = new FormData(form);

            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Adding...';

            fetch('/cart/add.json', {
                method: 'POST',
                headers:{
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'  
                },
                body: JSON.stringify({
                    id: formData.get('id'),
                    quantity: formData.get('quantity') || 1
                })
            })
            .then( res=> res.json())
            .then(data=>{
                console.log('Added to Cart: ', data);

                addToCartBtn.disabled = false;
                addToCartBtn.textContent = 'Add to Cart';

                updateCartDrawer();
            })
            .catch(err=>{
                console.error('Error: ', err);

                addToCartBtn.disabled = false;
                addToCartBtn.textContent = 'Add to Cart';
            });
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

      <div class="cart-drawer__item-image">
        <img src="${item.image}" alt="${item.product_title}" width="80" height="80" loading="lazy">
      </div>

      <div class="cart-drawer__item-content">

        <div class="cart-drawer__item-top">
          <a href="${item.url}" class="cart-drawer__item-title">${item.product_title}</a>

          <!-- Remove button -->
          <button 
            class="cart-drawer__item-remove" 
            data-key="${item.key}"
            aria-label="Remove ${item.product_title}"
          >
            &times;
          </button>
        </div>

        <!-- Variant -->
        ${
          item.variant_title && item.variant_title !== 'Default Title'
            ? `<p class="cart-drawer__item-variant">${item.variant_title}</p>`
            : ''
        }

        <div class="cart-drawer__item-bottom">

          <!-- Quantity control -->
          <div class="cart-drawer__qty">
            <button class="cart-drawer__qty-btn" data-key="${item.key}" data-action="decrease">−</button>
            <span class="cart-drawer__qty-value">${item.quantity}</span>
            <button class="cart-drawer__qty-btn" data-key="${item.key}" data-action="increase">+</button>
          </div>

          <!-- Price -->
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
      updateCartItem(key, 0); // quantity 0 মানে remove
    });
  });

  // Quantity buttons
  document.querySelectorAll('.cart-drawer__qty-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const key = this.dataset.key;
      const action = this.dataset.action;
      const qtyEl = this.parentElement.querySelector('.cart-drawer__qty-value');
      let currentQty = parseInt(qtyEl.textContent);

      const newQty = action === 'increase' ? currentQty + 1 : currentQty - 1;

      if (newQty < 1) {
        updateCartItem(key, 0); // remove
      } else {
        updateCartItem(key, newQty);
      }
    });
  });
}

// ─── Cart Item Update API ─────────────────────────────────────────────────────

function updateCartItem(key, quantity) {
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
    })
    .catch((err) => console.error('Update error:', err));
}

// ─── Format Money ─────────────────────────────────────────────────────────────

function formatMoney(cents) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: window.Shopify?.currency?.active || 'USD',
  });
}