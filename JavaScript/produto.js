// Função para obter parâmetro da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Carregar produto
async function carregarProduto() {
    const produtoId = getUrlParameter('id');

    if (!produtoId) {
        document.getElementById('produto-container').innerHTML =
            '<div class="produto-não-encontrado">Produto não encontrado</div>';
        return;
    }

    try {
        const response = await fetch('products.json');
        const produtos = await response.json();
        const produto = produtos.find(p => p.id == produtoId);

        if (!produto) {
            document.getElementById('produto-container').innerHTML =
                '<div class="produto-não-encontrado">Produto não encontrado</div>';
            return;
        }

        // Renderizar produto
        document.title = produto.name + ' - Élett Store';

        const precoComDesconto = (produto.price * 0.97).toFixed(2);
        const parcelado = (produto.price / 2).toFixed(2);
        const imagensProduto = Array.isArray(produto.images) && produto.images.length
            ? produto.images
            : [produto.image];

        document.getElementById('produto-container').innerHTML = `
            <div class="produto-imagem-container">
                <div class="produto-galeria">
                    <img id="produto-imagem-principal" src="${imagensProduto[0]}" alt="${produto.name}" class="produto-imagem">
                    <div class="produto-thumbs">
                        ${imagensProduto.map((img, index) => `
                            <button type="button" class="produto-thumb${index === 0 ? ' active' : ''}" data-src="${img}" data-alt="${produto.name} ${index + 1}">
                                <img src="${img}" alt="${produto.name} ${index + 1}">
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
      <div class="produto-info">
        <a href="index.html" class="voltar-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0L6.59 1.41L12.17 7H0v2h12.17l-5.58 5.59L8 16l8-8z" transform="rotate(180 8 8)"/>
          </svg>
          Voltar para a loja
        </a>
        
        <h1 class="produto-titulo">${produto.name}</h1>
        
        <div class="produto-info-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
          </svg>
          Em estoque
        </div>

        <div class="produto-preco-container">
          <p class="produto-preco">R$ ${produto.price.toFixed(2).replace('.', ',')}</p>
          <p class="produto-preco-pix">R$ ${precoComDesconto.replace('.', ',')} no PIX (3% de desconto)</p>
          <p class="produto-preco-parcelado">ou 2x de R$ ${parcelado.replace('.', ',')} sem juros</p>
        </div>

        <div class="produto-descricao">
          <h4>Descrição do Produto</h4>
          ${produto.descriçao}
        </div>

        <div class="quantidade-section">
          <label class="quantidade-label">Quantidade</label>
          <div class="quantidade-controls">
            <button class="quantidade-btn" onclick="diminuirQuantidade()">−</button>
            <input type="number" id="quantidade" class="quantidade-input" value="1" min="1" readonly>
            <button class="quantidade-btn" onclick="aumentarQuantidade()">+</button>
          </div>
        </div>

        <button class="adicionar-carrinho-btn" onclick="adicionarAoCarrinho(${produto.id})">
          Adicionar ao Carrinho
        </button>
      </div>
    `;
        configurarGaleria(imagensProduto, produto.name);
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        document.getElementById('produto-container').innerHTML =
            '<div class="produto-não-encontrado">Erro ao carregar produto</div>';
    }
}

function configurarGaleria(imagens, nomeProduto) {
    const imagemPrincipal = document.getElementById('produto-imagem-principal');
    const thumbs = document.querySelectorAll('.produto-thumb');
    if (!imagemPrincipal || !thumbs.length) return;

    thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
            const novaImagem = thumb.dataset.src;
            imagemPrincipal.src = novaImagem;
            imagemPrincipal.alt = nomeProduto;
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
}

// Funções de quantidade
function aumentarQuantidade() {
    const input = document.getElementById('quantidade');
    input.value = parseInt(input.value) + 1;
}

function diminuirQuantidade() {
    const input = document.getElementById('quantidade');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Adicionar ao carrinho
function adicionarAoCarrinho(produtoId) {
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const btn = document.querySelector('.adicionar-carrinho-btn');

    // Obter carrinho atual
    let carrinho = JSON.parse(localStorage.getItem('cart')) || [];

    // Verificar se produto já está no carrinho
    const itemExistente = carrinho.find(item => item.product_id === produtoId);

    if (itemExistente) {
        itemExistente.quantity += quantidade;
    } else {
        carrinho.push({
            product_id: produtoId,
            quantity: quantidade
        });
    }

    // Salvar carrinho
    localStorage.setItem('cart', JSON.stringify(carrinho));

    // Atualizar contador e renderização do carrinho
    atualizarContadorCarrinho();
    renderizarCarrinho(carrinho);

    // Feedback visual melhorado
    const textoOriginal = btn.textContent;
    btn.textContent = '✓ Adicionado ao carrinho!';
    btn.style.backgroundColor = '#4caf50';

    setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.backgroundColor = '#5bb299';
    }, 3000);
}

// Renderizar carrinho como no index.html
function renderizarCarrinho(carrinho) {
    const listCartHTML = document.querySelector('.listCart');
    const iconCartSpan = document.querySelector('.icon-cart span');

    listCartHTML.innerHTML = '';
    let totalQuantity = 0;

    fetch('products.json')
        .then(response => response.json())
        .then(produtos => {
                        if (carrinho.length > 0) {
                                carrinho.forEach(cart => {
                                        totalQuantity += cart.quantity;
                                        const produto = produtos.find(p => p.id == cart.product_id);

                                        if (produto) {
                                                let newCart = document.createElement('div');
                                                newCart.classList.add('it');
                                                newCart.dataset.id = cart.product_id;
                                                newCart.innerHTML = `
              <div class="image">
                <img src="${produto.image}" alt="">
              </div>
              <div class="name_cart">
                ${produto.name}
              </div>
              <div class="totalPrice">
                R$${(produto.price * cart.quantity).toFixed(2).replace('.', ',')}
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
                                        }
                                });
                        } else {
                                const emptyMessage = document.createElement('div');
                                emptyMessage.classList.add('cart-vazio');
                                emptyMessage.textContent = 'Nenhum item no carrinho de compras.';
                                listCartHTML.appendChild(emptyMessage);
                        }

            // Atualizar ícone e subtotal
            iconCartSpan.innerText = totalQuantity;
            atualizarSubtotalCarrinho(carrinho, produtos);

            // Adicionar eventos aos botões de mais/menos
            adicionarEventosCarrinho();
        });
}

// Atualizar subtotal
function atualizarSubtotalCarrinho(carrinho, produtos) {
    let subtotal = 0;
    carrinho.forEach(cart => {
        const produto = produtos.find(p => p.id == cart.product_id);
        if (produto) {
            subtotal += produto.price * cart.quantity;
        }
    });

    const subtotalElement = document.getElementById('cart-subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
    }
}

// Adicionar eventos aos botões de mais/menos e remover do carrinho
let eventosCarrinhoVinculados = false;
function adicionarEventosCarrinho() {
    if (eventosCarrinhoVinculados) return;
    const listCartHTML = document.querySelector('.listCart');
    if (!listCartHTML) return;
    eventosCarrinhoVinculados = true;

    listCartHTML.addEventListener('click', (event) => {
        let positionClick = event.target;

        // Eventos de mais/menos
        if (positionClick.classList.contains('menos') || positionClick.classList.contains('mais')) {
            let product_id = positionClick.parentElement.parentElement.dataset.id;
            let type = 'menos';
            if (positionClick.classList.contains('mais')) {
                type = 'mais';
            }
            modificarQuantidadeCarrinho(product_id, type);
        }

        // Evento de remover
        if (positionClick.closest('.btn-remover-carrinho')) {
            let product_id = positionClick.closest('.btn-remover-carrinho').dataset.id;
            removerDoCarrinho(parseInt(product_id));
        }
    });
}

// Remover produto do carrinho
function removerDoCarrinho(product_id) {
    let carrinho = JSON.parse(localStorage.getItem('cart')) || [];
    carrinho = carrinho.filter(item => item.product_id !== product_id);
    localStorage.setItem('cart', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    renderizarCarrinho(carrinho);
}

// Modificar quantidade no carrinho
function modificarQuantidadeCarrinho(product_id, type) {
    let carrinho = JSON.parse(localStorage.getItem('cart')) || [];
    let positionItemInCart = carrinho.findIndex((value) => value.product_id == parseInt(product_id));

    if (positionItemInCart >= 0) {
        if (type === 'mais') {
            carrinho[positionItemInCart].quantity += 1;
        } else {
            let valueChange = carrinho[positionItemInCart].quantity - 1;
            if (valueChange > 0) {
                carrinho[positionItemInCart].quantity = valueChange;
            } else {
                carrinho.splice(positionItemInCart, 1);
            }
        }
    }

    localStorage.setItem('cart', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    renderizarCarrinho(carrinho);
}

// Atualizar contador do carrinho
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('cart')) || [];
    const total = carrinho.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.icon-cart span').textContent = total;
}

// Carregar produto ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    const iconCart = document.querySelector('.icon-cart');
    const closeCart = document.querySelector('.close');
    const body = document.querySelector('body');

    if (iconCart && closeCart && body) {
        iconCart.addEventListener('click', () => {
            body.classList.toggle('showCart');
        });
        closeCart.addEventListener('click', () => {
            body.classList.toggle('showCart');
        });
    }

    carregarProduto();
    atualizarContadorCarrinho();
    // Renderizar carrinho existente ao carregar
    let carrinho = JSON.parse(localStorage.getItem('cart')) || [];
    renderizarCarrinho(carrinho);
});
