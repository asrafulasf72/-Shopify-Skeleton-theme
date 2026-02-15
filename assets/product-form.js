// $(document).ready(function(){
//     if($('[name="add"]').length>0){
//         $(document).on("click", "button[name='add']", function(e){
//            e.preventDefault();
//            var formData = $(this).closest('.product-form[action="/cart/add"')
//            $.ajax({
//             type: 'post',
//             url: '/cart/add.js',
//             dataType: 'json',
//             data: formData,
//             success: function(data){
//                 console.log('data', data);
//             },
//             error: 'Add to cart error!'
//            })
//         })
//     }
// })


document.addEventListener("click", function (e) {
  const button = e.target.closest("button[name='add']");
  if (!button) return;

  e.preventDefault();

  const form = button.closest("form[action='/cart/add']");
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
      console.log("data", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });
});
