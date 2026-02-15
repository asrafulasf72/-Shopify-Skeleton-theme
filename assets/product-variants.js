document.addEventListener("DOMContentLoaded", function () {

  const variantSelect = document.querySelector(".variants");
  const hiddenInput = document.querySelector("input[name='id']");
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const stockStatus = document.getElementById("stock-status");

  function updateSelection() {

    let selectedValues = [];

    document.querySelectorAll(".product-options input[type='radio']:checked")
      .forEach(function (radio) {
        selectedValues.push(radio.value);
      });

    const finalTitle = selectedValues.join(" / ");

    variantSelect.querySelectorAll("option").forEach(function (option) {

      if (option.textContent.trim() === finalTitle) {

        option.selected = true;
        hiddenInput.value = option.value;

        const quantity = parseInt(option.dataset.quantity);
        const isAvailable = option.dataset.available === "true";
        const inventoryManaged = option.dataset.inventoryManagement !== "null";
        const inventoryPolicy = option.dataset.inventoryPolicy;

        // 🔥 PROFESSIONAL STOCK LOGIC

        if (!inventoryManaged) {
          stockStatus.textContent = "Available";
          addToCartBtn.disabled = false;
          return;
        }

        if (quantity > 0) {
          stockStatus.textContent = quantity + " items available";
          addToCartBtn.disabled = false;
          addToCartBtn.textContent = "Add to cart";
        } else {

          if (inventoryPolicy === "continue") {
            stockStatus.textContent = "0 items available";
            addToCartBtn.disabled = false; // overselling allowed
          } else {
            stockStatus.textContent = "0 items available";
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = "Sold Out";
          }

        }

      }
    });
  }

  document.querySelectorAll(".product-options input[type='radio']")
    .forEach(function (radio) {
      radio.addEventListener("change", updateSelection);
    });

  updateSelection();
});
