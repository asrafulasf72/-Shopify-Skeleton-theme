document.addEventListener("DOMContentLoaded", function () {

  function updateSelection() {
    let selectedValues = "";

    // 1️⃣ Collect checked radio values
    const checkedRadios = document.querySelectorAll(
      ".product-options input[type='radio']:checked"
    );

    checkedRadios.forEach(function (radio) {
      selectedValues += (selectedValues ? " / " : "") + radio.value;
    });

    // 2️⃣ Match select option text & select it
    const variantOptions = document.querySelectorAll(".variants option");

    for (let option of variantOptions) {
      if (option.textContent.trim() === selectedValues) {
        option.selected = true;
        break; // same as `return false` in jQuery
      }
    }
  }

  // 3️⃣ Attach change event to radios
  const allRadios = document.querySelectorAll(
    ".product-options input[type='radio']"
  );

  allRadios.forEach(function (radio) {
    radio.addEventListener("change", updateSelection);
  });

  // 4️⃣ Initial run
  updateSelection();
});
