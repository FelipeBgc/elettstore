// JavaScript/carrinho.js

let iconCart = null;
let closeCart = null;
let body = document.body;
let listProductHTML = null;
let listCartHTML = null;
let iconCartSpan = null;
let eventsBound = false;

let listProducts = [];
let carts = [];

const refreshCartElements = () => {
    iconCart = document.querySelector('.icon-cart');
    iconCartSpan = document.querySelector('.icon-cart span');
    listProductHTML = document.querySelector('.listProduct');
    listCartHTML = document.querySelector('.listCart');
    closeCart = document.querySelector('.close');
}

const ensureCartIcon = () => {
    if (document.querySelector('.icon-cart')) return;

    const header = document.querySelector('header');
    const icon = document.createElement('div');
    icon.classList.add('icon-cart');
    icon.innerHTML = `
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="31" height="31" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312" />
        </svg>
        <span>0</span>
    `;

    if (header) {
        header.appendChild(icon);
    } else {
        document.body.prepend(icon);
    }
}

const ensureCartTab = () => {
    if (document.querySelector('.cartTab')) return;

    const cartTab = document.createElement('div');
    cartTab.classList.add('cartTab');
    cartTab.innerHTML = `
        <h1>Carrinho de compras</h1>
        <div class="listCart"></div>
        <div class="cart-summary">
            <div class="summary-subtotal">
                <span>Subtotal:</span>
                <span id="cart-subtotal">R$ 0,00</span>
            </div>
        </div>
        <div class="btn_cart">
            <button class="close">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                </svg>
            </button>
            <a href="checkout.html"><button class="checkOut">Finalizar Compra</button></a>
        </div>
    `;

    document.body.appendChild(cartTab);
}

const setupCartEvents = () => {
    if (eventsBound) return;
    eventsBound = true;

    if (iconCart) {
        iconCart.addEventListener('click', () => {
            body.classList.toggle('showCart');
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            body.classList.toggle('showCart');
        });
    }

    if (listProductHTML) {
        listProductHTML.addEventListener('click', (event) => {
            let positionClick = event.target;
            if (positionClick.classList.contains('addCart')) {
                let product_id = positionClick.parentElement.dataset.id;
                addToCart(product_id);
            }
        });
    }

    if (listCartHTML) {
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
        });
    }
}

// adicionando produtos ao HTML
const addDataToHTML = () => {
    if (!listProductHTML) return;
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
        let totalQuantity = 0;

        if (!listCartHTML) {
                carts.forEach(cart => {
                        totalQuantity = totalQuantity + cart.quantity;
                });
                if (iconCartSpan) {
                        iconCartSpan.innerText = totalQuantity;
                }
                updateCartSubtotal();
                return;
        }

        listCartHTML.innerHTML = '';
        if (carts.length > 0) {
                carts.forEach(cart => {
                        totalQuantity = totalQuantity + cart.quantity;
                        let newCart = document.createElement('div');
                        newCart.classList.add('it');
                        newCart.dataset.id = cart.product_id;
                        let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
                        let info = listProducts[positionProduct];
                        if (!info) return;
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
        if (iconCartSpan) {
                iconCartSpan.innerText = totalQuantity;
        }
        updateCartSubtotal();
}


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
    const path = window.location.pathname.toLowerCase();
    const hideCartPages = ['/login.html', '/signup.html'];
    const isHiddenPage = hideCartPages.some(page => path.endsWith(page));

    if (!isHiddenPage) {
        ensureCartIcon();
        ensureCartTab();
    }

    refreshCartElements();
    setupCartEvents();

    // obtendo dados do  json
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            const produtosIndex = data.filter(product => product.home === true);
            listProducts = produtosIndex.length > 0 ? produtosIndex : data;
            addDataToHTML();

            // pegando o cart memory
            carts = JSON.parse(localStorage.getItem('cart')) || [];
            if (!isHiddenPage) {
                addCartToHTML();
            }
        })
}
initApp();