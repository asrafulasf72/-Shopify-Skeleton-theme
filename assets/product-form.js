// document.addEventListener("click", function (e) {
//   const button = e.target.closest("button[name='add']");
//   if (!button) return;

//   e.preventDefault();

//   const form = button.closest("form");
//   if (!form) return;

//   const formData = new FormData(form);

//   fetch("/cart/add.js", {
//     method: "POST",
//     body: formData,
//     headers: {
//       "Accept": "application/json"
//     }
//   })
//     .then(response => {
//       if (!response.ok) {
//         throw new Error("Add to cart error!");
//       }
//       return response.json();
//     })
//     .then(data => {

//       console.log("Added:", data);

//       // ✅ Open Cart Drawer
//       const cartDrawer = document.querySelector(".cart-drawer");
//       const cartOverlay = document.querySelector(".cart-overlay");

//       if (cartDrawer && cartOverlay) {
//         cartDrawer.classList.add("active");
//         cartOverlay.classList.add("active");
//       }

//       // ✅ Update Cart Counter
//       updateCartCount();

//     })
//     .catch(error => {
//       console.error("Error:", error);
//     });
// });


// // 🔥 Function to update cart counter
// function updateCartCount() {
//   fetch("/cart.js")
//     .then(response => response.json())
//     .then(cart => {
//       const cartCounter = document.getElementById("cartcounter");

//       if (cartCounter) {
//         cartCounter.textContent = cart.item_count;
//       }
//     });
// }

document.addEventListener("DOMContentLoaded", function () {

  const cartDrawer = document.querySelector(".cart-drawer");
  const cartOverlay = document.querySelector(".cart-overlay");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotalPrice = document.querySelector(".cart-total-price");
  const cartCounter = document.getElementById("cartcounter");

  /* =====================================================
     ADD TO CART (ONLY UPDATE COUNTER)
  ===================================================== */
  document.addEventListener("click", function (e) {

    const addBtn = e.target.closest("button[name='add']");
    if (!addBtn) return;

    e.preventDefault();

    const form = addBtn.closest("form");
    if (!form) return;

    const formData = new FormData(form);

    fetch("/cart/add.js", {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    })
    .then(res => res.json())
    .then(() => {
      updateCartCounter();
    })
    .catch(err => console.error("Add error:", err));
  });



  /* =====================================================
     OPEN CART DRAWER FROM ICON
  ===================================================== */
  document.addEventListener("click", function (e) {

    const cartBtn = e.target.closest(".cart-toggle-btn");
    if (!cartBtn) return;

    openDrawer();
    loadCart();
  });



  /* =====================================================
     LOAD CART CONTENT
  ===================================================== */
  function loadCart() {

    fetch("/cart.js")
      .then(res => res.json())
      .then(cart => {

        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = "";

        if (cart.item_count === 0) {
          cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
          if (cartTotalPrice) cartTotalPrice.innerHTML = formatMoney(0);
          return;
        }

        cart.items.forEach((item, index) => {

          cartItemsContainer.innerHTML += `
            <div class="cart-item">
              <img src="${item.image}" alt="${item.product_title}" width="70"/>

              <div class="cart-item-info">
                <div class="cart-item-title">${item.product_title}</div>
                <div class="cart-item-price">${formatMoney(item.line_price)}</div>

                <div class="cart-qty-wrapper">
                  <button class="qty-plus" data-line="${index + 1}">+</button>

                  <input type="number"
                         value="${item.quantity}"
                         min="1"
                         data-line="${index + 1}"
                         class="cart-qty-input" />
                   <button class="qty-minus" data-line="${index + 1}">-</button>
                  
                </div>

                <button class="remove-item"
                        data-line="${index + 1}">
                        Remove
                </button>
              </div>
            </div>
          `;
        });

        if (cartTotalPrice)
          cartTotalPrice.innerHTML = formatMoney(cart.total_price);

      });
  }



  /* =====================================================
     REMOVE ITEM
  ===================================================== */
  document.addEventListener("click", function (e) {

    const removeBtn = e.target.closest(".remove-item");
    if (!removeBtn) return;

    const line = removeBtn.dataset.line;

    updateLine(line, 0);
  });



  /* =====================================================
     INCREASE / DECREASE QTY BUTTONS
  ===================================================== */
  document.addEventListener("click", function (e) {

    const plusBtn = e.target.closest(".qty-plus");
    const minusBtn = e.target.closest(".qty-minus");

    if (!plusBtn && !minusBtn) return;

    const line = (plusBtn || minusBtn).dataset.line;

    fetch("/cart.js")
      .then(res => res.json())
      .then(cart => {

        const item = cart.items[line - 1];
        if (!item) return;

        let newQty = item.quantity;

        if (plusBtn) newQty++;
        if (minusBtn) newQty = Math.max(1, newQty - 1);

        updateLine(line, newQty);
      });
  });



  /* =====================================================
     MANUAL INPUT CHANGE
  ===================================================== */
  document.addEventListener("change", function (e) {

    if (!e.target.classList.contains("cart-qty-input")) return;

    const line = e.target.dataset.line;
    const quantity = parseInt(e.target.value);

    if (quantity < 1) return;

    updateLine(line, quantity);
  });



  /* =====================================================
     UPDATE LINE FUNCTION
  ===================================================== */
  function updateLine(line, quantity) {

    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        line: line,
        quantity: quantity
      })
    })
    .then(() => {
      updateCartCounter();
      loadCart();
    });
  }



  /* =====================================================
     UPDATE CART COUNTER
  ===================================================== */
  function updateCartCounter() {
    fetch("/cart.js")
      .then(res => res.json())
      .then(cart => {
        if (cartCounter)
          cartCounter.textContent = cart.item_count;
      });
  }



  /* =====================================================
     OPEN / CLOSE DRAWER
  ===================================================== */
  function openDrawer() {
    cartDrawer?.classList.add("active");
    cartOverlay?.classList.add("active");
  }

  function closeDrawer() {
    cartDrawer?.classList.remove("active");
    cartOverlay?.classList.remove("active");
  }

  document.querySelector(".cart-close-btn")?.addEventListener("click", closeDrawer);
  cartOverlay?.addEventListener("click", closeDrawer);



  /* =====================================================
     MONEY FORMATTER
  ===================================================== */
  function formatMoney(cents) {
    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  }

});