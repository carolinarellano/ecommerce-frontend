const productList = document.querySelector('#products-list');
const nextPageB = document.querySelector('#next-btn');
const previousPageB = document.querySelector('#previous-btn');
let currentPage = 1;

nextPageB.addEventListener("click", nextPage);
previousPageB.addEventListener("click", prevPage);

const itemsPerPage = 4;
let productsData = [];

function createProductModal(product) {
    const modalId = `addToCart-${product._uuid}`;
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = modalId;
    modal.tabIndex = -1;
    modal.role = 'dialog';
    modal.setAttribute('aria-labelledby', 'modelTitleId');
    modal.setAttribute('aria-hidden', 'true');

    const modalContent = `
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add to cart</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <label for="addItems">Quantity</label>
            <input type="number" name="addItems" id="addItems" value="1">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary addToCart" data-dismiss="modal">Add to cart</button>
          </div>
        </div>
      </div>
    `;

    modal.innerHTML = modalContent;

    const addToCartButton = modal.querySelector('.addToCart');
    const quantityInput = modal.querySelector('#addItems');

    addToCartButton.addEventListener('click', () => {
        const quantity = quantityInput.value;
        addToCart(product, quantity);
    });

    return modal;
}


function showProducts(page = 1) {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const productsToDisplay = productsData.slice(startIdx, endIdx);

    clearHTML();

    for (let product of productsToDisplay) {
        const { _uuid, _title, _description, _imageURL, _unit, _category, _pricePerUnit, _stock } = product;
        const modal = createProductModal(product);
        const modalId = modal.id;

        const col = document.createElement('div');
        col.classList.add('col-md-3');
        const productDiv = document.createElement('div');
        productDiv.classList.add('card');
        productDiv.classList.add('text-start');
        productDiv.innerHTML = `
            <img class="card-img-top" src="${_imageURL}" alt="${_title}">
            <div class="card-body">
                <h4 class="card-title">${_title}</h4>
                <p class="card-text">${_category}<br>$${_pricePerUnit}</p>
                <button type="button" class="btn btn-info" data-toggle="modal" data-target="#${modalId}">Add to cart</button>
            `;

        col.appendChild(productDiv);
        productList.appendChild(col);
        document.body.appendChild(modal);
    }
}

function loadProductsData() {
    fetch('http://localhost:3000/products')
        .then((res) => res.json())
        .then((data) => {
            productsData = data;
            showProducts(currentPage);
        });
}

function nextPage() {
    currentPage++;
    showProducts(currentPage);
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        showProducts(currentPage);
    }
}

function clearHTML() {
    while (productList.firstChild) {
        productList.removeChild(productList.firstChild);
    }
}

function addToCart(product, quantity) {
    quantity = parseInt(quantity);
    if (quantity <= 0)
        return alert("Quantity cannot be less than zero");

    let cart = JSON.parse(sessionStorage.getItem('cart')) || {};
    if (cart[product._uuid]) {
        cart[product._uuid].quantity += quantity;
    } else {
        cart[product._uuid] = { product, quantity };
    }
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

loadProductsData();