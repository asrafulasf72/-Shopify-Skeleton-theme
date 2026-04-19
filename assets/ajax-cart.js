document.addEventListener('DOMContentLoaded', ()=>{
  const debugBtn= document.getElementById('debug-cart-btn')
  const debugCartOutput = document.getElementById('debug-cart-output')

  if( !debugBtn || !debugCartOutput ) return

  debugBtn.addEventListener('click', ()=>{
     fetch(window.Shopify.routes.root + 'cart.js')
     .then((response)=>response.json())
     .then((cart)=>{
        console.log("Cart JSON", cart)
        debugCartOutput.textContent= JSON.stringify(cart, null,2)
     })
     .catch((error)=>{
        console.error("Error fething cart: ", error)
        debugCartOutput.textContent= 'Error: '+error.message;
     })

     
  })
})


function addToCart(variantId, quantity=1){
    const body ={
        items:[
            {
                id:variantId,
                quantity:quantity
            }
        ]
    };
     return fetch(window.Shopify.routes.root + 'cart/add.js',{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body)
})
.then((response)=> response.json())
.then((data)=>{
    console.log('Add to cart: ', data);
    return data
})
}

document.addEventListener('DOMContentLoaded', ()=>{
    const addBtn= document.getElementById('ajax-add-to-cart-btn')

    if(!addBtn) return
     
  addBtn.addEventListener('click', ()=>{
        const variantId = Number(addBtn.dataset.variantId)
    const quantity=1;

    addToCart(variantId, quantity)
    .then(()=>{
        alert("Added to cart Via Ajax")
    }).catch((error)=>{
        console.error("Added to cart error: ", error);
        alert("Error adding to cart")
    })
  })
})


function updateCartCount(){
    const countElement = document.querySelector('[data-cart-count]')
    if(!countElement) return
    
    fetch(window.Shopify.routes.root + 'cart.js')
    .then((res)=> res.json())
    .then((cart)=>{
        countElement.textContent= cart.item_count;
    })
    .catch((error)=> console.error('Error Updating cart count: ', error));
}

document.addEventListener('DOMContentLoaded', ()=>{
    updateCartCount();

    const btn = document.getElementById('ajax-add-to-cart-btn')
    if(btn){
        btn.addEventListener('click', ()=>{
            const variantId = Number(btn.dataset.variantId || 0);
            if(!variantId) return;

            addToCart(variantId, 1)
            .then(()=>{
                updateCartCount();
            })
            .catch((error)=>console.error('Add to cart error: ', error))
        })
    }
})