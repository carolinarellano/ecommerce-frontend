document.addEventListener('DOMContentLoaded', () => {
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartCount = document.getElementById('cart-count');
  
    // Inicializar contador
    fetchCartCount();
  
    cartButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const productId = button.getAttribute('data-product-id');
  
        try {
          const response = await fetch('/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              product_id: parseInt(productId),
              quantity: 1
            })
          });
  
          const data = await response.json();
  
          if (response.ok) {
            alert('Producto añadido al carrito');
            updateCartCount(); // Actualizar contador al agregar
          } else {
            alert(data.error || 'Error al añadir al carrito');
          }
        } catch (error) {
          console.error('Error al agregar al carrito:', error);
          alert('Error de conexión al agregar al carrito');
        }
      });
    });
  });
  
  // Función para obtener cantidad de productos en carrito
  async function fetchCartCount() {
    const cartCount = document.getElementById('cart-count');
    try {
      const response = await fetch('/cart');
      const data = await response.json();
  
      if (response.ok) {
        const count = data.cartItems.length;
        cartCount.textContent = count;
      }
    } catch (error) {
      console.error('Error al cargar cantidad del carrito:', error);
    }
  }
  
  // Función para actualizar contador al agregar
  function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    let current = parseInt(cartCount.textContent) || 0;
    cartCount.textContent = current + 1;
  }
  

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

async function loadCart() {
    try {
        const response = await fetch('/cart');
        const data = await response.json();

        if (response.ok) {
            renderCart(data.cartItems || []);
        } else {
            console.error('Error al cargar carrito:', data.error);
        }
    } catch (error) {
        console.error('Error de conexión al cargar carrito:', error);
    }
}

function renderCart(cartItems) {
    const productsInCart = document.getElementById('productsInCart');
    const cartTotal = document.getElementById('total');
    const totalCostElement = document.getElementById('totalCost');

    productsInCart.innerHTML = '';
    totalCostElement.innerHTML = '';

    if (cartItems.length === 0) {
        productsInCart.innerHTML = `
        <div class="no-items text-center">
            <img src="https://i.ibb.co/Js50VMJ/Fun-Bag.jpg" alt="Fun-Bag" style="max-width:200px;"><br>
            <h4>No hay productos en el carrito</h4>
        </div>`;
        cartTotal.innerText = '0';
        return;
    }

    let total = 0;
    const summaryListItems = [];

    cartItems.forEach(item => {
        const { id, title, description, imageURL, pricePerUnit, quantity, category } = item;

        const totalPrice = quantity * pricePerUnit;
        total += totalPrice;

        const productDiv = document.createElement('div');
        productDiv.classList.add('card', 'mb-3');
        productDiv.innerHTML = `
            <div class="card-body d-flex justify-content-between">
                <div class="d-flex flex-row align-items-center">
                    <img src="${imageURL}" class="img-fluid rounded-2" style="width: 150px;" alt="Shopping item">
                    <div class="ms-3">
                        <h5>${title}</h5>
                        <p class="small mb-0">${description}</p>
                        <small class="text-muted">${category}</small>
                    </div>
                </div>
                <div class="d-flex flex-column align-items-end">
                    <input type="number" value="${quantity}" min="1" class="form-control mb-2 quantity-input" data-id="${id}">
                    <h5>$${totalPrice.toFixed(2)}</h5>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${id}">Eliminar</button>
                </div>
            </div>
        `;
        productsInCart.appendChild(productDiv);

        summaryListItems.push(`<li>${quantity} x ${title} = $${totalPrice.toFixed(2)}</li>`);
    });

    cartTotal.innerText = total.toFixed(2);

    const deliveryCost = 10;
    const grandTotal = total + deliveryCost;

    const summaryHTML = `
        <div class="card">
            <div class="card-body">
                <h4>Resumen de Compra</h4>
                <ul style="list-style:none;">
                    ${summaryListItems.join('')}
                    <li><strong>Envío:</strong> $${deliveryCost.toFixed(2)}</li>
                </ul>
                <hr>
                <h5>Total: $${grandTotal.toFixed(2)}</h5>
                <div class="text-end">
                    <button class="btn btn-success">Proceder al pago</button>
                </div>
            </div>
        </div>
    `;

    totalCostElement.innerHTML = summaryHTML;

    addCartEventListeners();
}

function addCartEventListeners() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const quantityInputs = document.querySelectorAll('.quantity-input');

    deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.getAttribute('data-id');
            await deleteCartItem(id);
            await loadCart();
        });
    });

    quantityInputs.forEach(input => {
        input.addEventListener('change', async () => {
            const id = input.getAttribute('data-id');
            const quantity = parseInt(input.value);
            if (quantity > 0) {
                await updateCartItem(id, quantity);
                await loadCart();
            } else {
                alert('Cantidad inválida');
            }
        });
    });
}

async function deleteCartItem(id) {
    try {
        const response = await fetch(`/cart/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const data = await response.json();
            console.error('Error al eliminar producto:', data.error);
        }
    } catch (error) {
        console.error('Error de conexión al eliminar producto:', error);
    }
}

async function updateCartItem(id, quantity) {
    try {
        const response = await fetch(`/cart/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        if (!response.ok) {
            const data = await response.json();
            console.error('Error al actualizar cantidad:', data.error);
        }
    } catch (error) {
        console.error('Error de conexión al actualizar cantidad:', error);
    }
}
