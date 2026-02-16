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


  /* =============================
      OPEN DRAWER FROM BAG ICON
  ============================== */
  document.addEventListener("click", function (e) {
    const bagBtn = e.target.closest(".cart-toggle-btn");
    if (bagBtn) {
      openCartDrawer();
      loadCart();
    }
  });


  /* =============================
      ADD TO CART
  ============================== */
  document.addEventListener("click", function (e) {

    const addButton = e.target.closest("button[name='add']");
    if (!addButton) return;

    e.preventDefault();

    const form = addButton.closest("form");
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
      openCartDrawer();
      loadCart();
    });
  });


  /* =============================
      REMOVE ITEM
  ============================== */
  document.addEventListener("click", function (e) {

    const removeBtn = e.target.closest(".remove-item");
    if (!removeBtn) return;

    const line = removeBtn.dataset.line;

    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        line: line,
        quantity: 0
      })
    }).then(() => {
      updateCartCounter();
      loadCart();
    });
  });


  /* =============================
      UPDATE QUANTITY
  ============================== */
  document.addEventListener("change", function (e) {

    if (!e.target.classList.contains("cart-qty-input")) return;

    const line = e.target.dataset.line;
    const quantity = e.target.value;

    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        line: line,
        quantity: quantity
      })
    }).then(() => {
      updateCartCounter();
      loadCart();
    });
  });


  /* =============================
      LOAD CART DATA
  ============================== */
  function loadCart() {
    fetch("/cart.js")
      .then(res => res.json())
      .then(cart => {

        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = "";

        if (cart.item_count === 0) {
          cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
          cartTotalPrice.innerHTML = formatMoney(0);
          return;
        }

        cart.items.forEach((item, index) => {

          cartItemsContainer.innerHTML += `
            <div class="cart-item">
              <img src="${item.image}" alt="${item.product_title}" />

              <div class="cart-item-info">
                <div class="cart-item-title">${item.product_title}</div>
                <div class="cart-item-price">${formatMoney(item.line_price)}</div>

                <div class="cart-quantity">
                  <input type="number"
                         min="1"
                         value="${item.quantity}"
                         data-line="${index + 1}"
                         class="cart-qty-input" />

                  <span class="remove-item"
                        data-line="${index + 1}">
                        Remove
                  </span>
                </div>
              </div>
            </div>
          `;
        });

        cartTotalPrice.innerHTML = formatMoney(cart.total_price);
      });
  }


  /* =============================
      UPDATE COUNTER ONLY
  ============================== */
  function updateCartCounter() {
    fetch("/cart.js")
      .then(res => res.json())
      .then(cart => {
        if (cartCounter) {
          cartCounter.textContent = cart.item_count;
        }
      });
  }


  /* =============================
      OPEN / CLOSE DRAWER
  ============================== */
  function openCartDrawer() {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  }

  document.querySelector(".cart-close-btn")?.addEventListener("click", closeDrawer);
  cartOverlay?.addEventListener("click", closeDrawer);

  function closeDrawer() {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
  }


  /* =============================
      SIMPLE MONEY FORMATTER
  ============================== */
  function formatMoney(cents) {
    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  }

});
