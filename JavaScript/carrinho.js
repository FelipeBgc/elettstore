// JavaScript/carrinho.js

let iconCart = document.querySelector('.icon-cart');
let closeCart = document.querySelector('.close')
let body = document.querySelector('body');
let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCartSpan = document.querySelector('.icon-cart span');

let listProducts = [];
let carts = [];

// abrir e fechar o carrinho
iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
})
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
})

// adicionando produtos ao HTML
const addDataToHTML = () => {
    listProductHTML.innerHTML = '';
    if (listProducts.length > 0) {
        listProducts.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('item_c');
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `
            <a href="produto.html?id=${product.id}">
            <img src="${product.image}" alt="">
                <h2>${product.name}</h2>
            </a>
                <div class="price">R$ ${product.price}.00</div>
                <button class="addCart">
                    Comprar
                </button>
                <span class="porc_desconto">${product.desc}</span>
            `;
            listProductHTML.appendChild(newProduct);
        })
    } 
}

// adicionando produtos ao carrinho
listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let product_id = positionClick.parentElement.dataset.id;
        addToCart(product_id);
    }
})


// função adicionar ao carrinho
const addToCart = (product_id) => {
    let positionThisProductInCart = carts.findIndex((value) => value.product_id == product_id);
    if (carts.length <= 0) {
        carts = [{
            product_id: product_id,
            quantity: 1
        }] 
    } else if (positionThisProductInCart < 0) {
        carts.push({
            product_id: product_id,
            quantity: 1
        })
    } else {
        carts[positionThisProductInCart].quantity = carts[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    addCartToMemory();
}
const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(carts));
}

// atualizando subtotal do carrinho
const updateCartSubtotal = () => {
    let subtotal = 0;
    carts.forEach(cart => {
        let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
        if (positionProduct >= 0) {
            let info = listProducts[positionProduct];
            subtotal += info.price * cart.quantity;
        }
    });

    // atualizando no HTML
    const subtotalElement = document.getElementById('cart-subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
    }
}

// adicionando produtos ao carrinho no HTML
const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if (carts.length > 0) {
        carts.forEach(cart => {
            totalQuantity = totalQuantity + cart.quantity;
            let newCart = document.createElement('div');
            newCart.classList.add('it');
            newCart.dataset.id = cart.product_id;
            let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
            let info = listProducts[positionProduct];
            newCart.innerHTML = `
            <div class="image">
          <img src="${info.image}" alt="">
        </div>
          <div class="name_cart">
          ${info.name}
          </div>
            <div class="totalPrice">
          R$${info.price * cart.quantity}.00
            </div>
              <div class="quantity">
                <span class="menos">&lt;</span>
                <span>${cart.quantity}</span>
                <span class="mais">&gt;</span>
                </div>
                            <button class="btn-remover-carrinho" data-id="${cart.product_id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
            `;
            listCartHTML.appendChild(newCart);
        })
    } else {
        let emptyMessage = document.createElement('div');
        emptyMessage.classList.add('cart-vazio');
        emptyMessage.textContent = 'Nenhum item no carrinho de compras.';
        listCartHTML.appendChild(emptyMessage);
    }
    iconCartSpan.innerText = totalQuantity;
    updateCartSubtotal();
}

// eventos de clique no carrinho
listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('menos') || positionClick.classList.contains('mais')) {
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'menos';
        if (positionClick.classList.contains('mais')) {
            type = 'mais';
        }
        changeQuantity(product_id, type);
    }
    if (positionClick.closest('.btn-remover-carrinho')) {
        let product_id = positionClick.closest('.btn-remover-carrinho').dataset.id;
        removerDoCarrinho(product_id);
    }
})

// remover do carrinho
const removerDoCarrinho = (product_id) => {
    carts = carts.filter(item => item.product_id != product_id);
    addCartToMemory();
    addCartToHTML();
}

// alterar quantidade no carrinho
const changeQuantity = (product_id, type) => {
    let positionItemInCart = carts.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        switch (type) {
            case 'mais':
                carts[positionItemInCart].quantity = carts[positionItemInCart].quantity + 1;
                break;

            default:
                let valueChange = carts[positionItemInCart].quantity - 1;
                if (valueChange > 0) {
                    carts[positionItemInCart].quantity = valueChange
                } else {
                    carts.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToMemory();
    addCartToHTML();
}

// iniciando o app
const initApp = () => {
    // obtendo dados do  json
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            const produtosIndex = data.filter(product => product.home === true);
            listProducts = produtosIndex.length > 0 ? produtosIndex : data;
            addDataToHTML();

            // pegando o cart memory
            carts = JSON.parse(localStorage.getItem('cart')) || [];
            addCartToHTML();
        })
}
initApp();