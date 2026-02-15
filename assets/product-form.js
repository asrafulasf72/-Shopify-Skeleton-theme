document.addEventListener("click", function (e) {
  const button = e.target.closest("button[name='add']");
  if (!button) return;

  e.preventDefault();

  const form = button.closest("form");
  if (!form) return;

  const formData = new FormData(form);

  fetch("/cart/add.js", {
    method: "POST",
    body: formData,
    headers: {
      "Accept": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Add to cart error!");
      }
      return response.json();
    })
    .then(data => {

      console.log("Added:", data);

      // ✅ Open Cart Drawer
      const cartDrawer = document.querySelector(".cart-drawer");
      const cartOverlay = document.querySelector(".cart-overlay");

      if (cartDrawer && cartOverlay) {
        cartDrawer.classList.add("active");
        cartOverlay.classList.add("active");
      }

      // ✅ Update Cart Counter
      updateCartCount();

    })
    .catch(error => {
      console.error("Error:", error);
    });
});


// 🔥 Function to update cart counter
function updateCartCount() {
  fetch("/cart.js")
    .then(response => response.json())
    .then(cart => {
      const cartCounter = document.getElementById("cartcounter");

      if (cartCounter) {
        cartCounter.textContent = cart.item_count;
      }
    });
}

