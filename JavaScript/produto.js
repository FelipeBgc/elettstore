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
                    <div class="galeria-wrapper">
                        <button type="button" class="galeria-seta galeria-seta-esquerda" id="galeriaAnterior">&lt;</button>
                        <img id="produto-imagem-principal" src="${imagensProduto[0]}" alt="${produto.name}" class="produto-imagem">
                        <button type="button" class="galeria-seta galeria-seta-direita" id="galeraProximo">&gt;</button>
                    </div>
                    <div class="produto-thumbs">
                        ${imagensProduto.map((img, index) => `
                            <button type="button" class="produto-thumb${index === 0 ? ' active' : ''}" data-src="${img}" data-alt="${produto.name} ${index + 1}">
                                <img src="${img}" alt="${produto.name} ${index + 1}">
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="modal-galeria" id="modalGaleria">
                <div class="modal-container">
                    <button type="button" class="modal-fechar" id="fecharModal">&times;</button>
                    <div class="modal-setas">
                        <button type="button" class="modal-seta" id="seteAnterior">&lt;</button>
                        <button type="button" class="modal-seta" id="seteProximo">&gt;</button>
                    </div>
                    <img id="modal-imagem-principal" src="${imagensProduto[0]}" alt="${produto.name}" class="modal-imagem-principal">
                    <div class="modal-thumbs-container" id="modalThumbs">
                        ${imagensProduto.map((img, index) => `
                            <button type="button" class="modal-thumb${index === 0 ? ' ativa' : ''}" data-index="${index}">
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
          Voltar
        </a>
        
        <div class="caminho"> Inicio > ${produto.categoria} > ${produto.name}</div>               

        <h1 class="produto-titulo">${produto.name}</h1>

        <div class="produto-cod">Cód.:${produto.id}</div>

        <div class="produto-avaliacao">
          <span class="avaliacao-estrelas">★★★★★</span>
          <span class="avaliacao-texto">${produto.avaliação}</span>
        </div>

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
      <div class="produto-descricao">
          <h3>Descrição do Produto</h3>
          ${produto.descriçao}
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
    const btnAnterior = document.getElementById('galeriaAnterior');
    const btnProximo = document.getElementById('galeraProximo');
    
    if (!imagemPrincipal || !thumbs.length) return;

    let indiceAtual = 0;

    // Configurar cliques nas miniaturas principais
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            const novaImagem = thumb.dataset.src;
            imagemPrincipal.src = novaImagem;
            imagemPrincipal.alt = nomeProduto;
            indiceAtual = index;
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            
            // Atualizar modal também
            const modalImagem = document.getElementById('modal-imagem-principal');
            if (modalImagem) {
                modalImagem.src = novaImagem;
            }
            atualizarModalThumbs(indiceAtual);
        });
    });

    // Configurar setas da galeria principal
    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            indiceAtual = (indiceAtual - 1 + imagens.length) % imagens.length;
            atualizarGaleriaPrincipal(indiceAtual, imagens, imagemPrincipal, thumbs, nomeProduto);
        });
    }

    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            indiceAtual = (indiceAtual + 1) % imagens.length;
            atualizarGaleriaPrincipal(indiceAtual, imagens, imagemPrincipal, thumbs, nomeProduto);
        });
    }

    // Configurar swipe/drag para mobile
    configurarSwipeGaleria(imagemPrincipal, imagens, thumbs, nomeProduto);

    // Configurar clique na imagem principal para abrir modal
    imagemPrincipal.addEventListener('click', abrirModal);

    // Configurar modal
    configurarModal(imagens, nomeProduto);
}

function atualizarGaleriaPrincipal(indice, imagens, imagemPrincipal, thumbs, nomeProduto) {
    imagemPrincipal.src = imagens[indice];
    imagemPrincipal.alt = nomeProduto;
    thumbs.forEach(t => t.classList.remove('active'));
    thumbs[indice].classList.add('active');
    
    // Atualizar modal também
    const modalImagem = document.getElementById('modal-imagem-principal');
    if (modalImagem) {
        modalImagem.src = imagens[indice];
    }
    atualizarModalThumbs(indice);
}

function configurarSwipeGaleria(imagemPrincipal, imagens, thumbs, nomeProduto) {
    let touchStartX = 0;
    let touchEndX = 0;
    let indiceAtual = 0;

    imagemPrincipal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    imagemPrincipal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(touchStartX, touchEndX);
    }, false);

    function handleSwipe(startX, endX) {
        const diferenca = startX - endX;
        const limiar = 50; // Mínimo de pixels para considerar como swipe

        if (Math.abs(diferenca) > limiar) {
            if (diferenca > 0) {
                // Swipe para esquerda = próxima imagem
                indiceAtual = (indiceAtual + 1) % imagens.length;
            } else {
                // Swipe para direita = imagem anterior
                indiceAtual = (indiceAtual - 1 + imagens.length) % imagens.length;
            }
            atualizarGaleriaPrincipal(indiceAtual, imagens, imagemPrincipal, thumbs, nomeProduto);
        }
    }
}

function abrirModal() {
    const modal = document.getElementById('modalGaleria');
    if (modal) {
        modal.classList.add('ativa');
        document.body.style.overflow = 'hidden';
    }
}

function fecharModal() {
    const modal = document.getElementById('modalGaleria');
    if (modal) {
        modal.classList.remove('ativa');
        document.body.style.overflow = 'auto';
    }
}

function configurarModal(imagens, nomeProduto) {
    const modal = document.getElementById('modalGaleria');
    const btnFechar = document.getElementById('fecharModal');
    const btnAnterior = document.getElementById('seteAnterior');
    const btnProximo = document.getElementById('seteProximo');
    const modalThumbs = document.querySelectorAll('.modal-thumb');
    const modalImagem = document.getElementById('modal-imagem-principal');

    if (!modal || !btnFechar || !modalImagem) return;

    let indiceAtual = 0;

    // Fechar modal ao clicar no botão X
    btnFechar.addEventListener('click', fecharModal);

    // Fechar modal ao clicar fora da imagem
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });

    // Navegar com as setas
    btnAnterior.addEventListener('click', () => {
        indiceAtual = (indiceAtual - 1 + imagens.length) % imagens.length;
        atualizarModalImagem(indiceAtual, imagens, modalImagem);
    });

    btnProximo.addEventListener('click', () => {
        indiceAtual = (indiceAtual + 1) % imagens.length;
        atualizarModalImagem(indiceAtual, imagens, modalImagem);
    });

    // Navegar com miniaturas do modal
    modalThumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            indiceAtual = index;
            atualizarModalImagem(indiceAtual, imagens, modalImagem);
            atualizarModalThumbs(indiceAtual);
        });
    });

    // Navegação com teclado
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('ativa')) return;
        
        if (e.key === 'ArrowLeft') {
            indiceAtual = (indiceAtual - 1 + imagens.length) % imagens.length;
            atualizarModalImagem(indiceAtual, imagens, modalImagem);
        } else if (e.key === 'ArrowRight') {
            indiceAtual = (indiceAtual + 1) % imagens.length;
            atualizarModalImagem(indiceAtual, imagens, modalImagem);
        } else if (e.key === 'Escape') {
            fecharModal();
        }
    });
}

function atualizarModalImagem(indice, imagens, elementoImagem) {
    elementoImagem.src = imagens[indice];
    atualizarModalThumbs(indice);
}

function atualizarModalThumbs(indice) {
    const modalThumbs = document.querySelectorAll('.modal-thumb');
    modalThumbs.forEach((thumb, index) => {
        if (index === indice) {
            thumb.classList.add('ativa');
        } else {
            thumb.classList.remove('ativa');
        }
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

// INFINITE SCROLL NA PÁGINA DE PRODUTO
// Carrega produtos relacionados abaixo da descrição

class ProdutoInfiniteScroll {
    constructor() {
        this.itemsPerPage = 6; // Produtos por carregamento
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMoreItems = true;
        this.allProducts = [];
        this.currentProductId = null;
        this.currentCategory = null;
        
        this.init();
    }

    async init() {
        // Pegar ID do produto atual
        this.currentProductId = this.getUrlParameter('id');
        
        if (!this.currentProductId) return;

        // Carregar todos os produtos
        await this.loadAllProducts();
        
        // Aguardar descrição do produto carregar
        this.waitForProductDescription();
    }

    waitForProductDescription() {
        // Verificar se a descrição do produto já foi carregada
        const checkDescription = setInterval(() => {
            const descricao = document.querySelector('.produto-descricao');
            
            if (descricao) {
                clearInterval(checkDescription);
                
                // Criar seção de produtos relacionados
                this.createRelatedProductsSection();
                
                // Carregar primeira página
                this.renderPage();
                
                // Configurar infinite scroll
                this.setupIntersectionObserver();
                window.addEventListener('scroll', () => this.handleScroll());
            }
        }, 100);
        
        // Timeout de segurança (parar após 5 segundos)
        setTimeout(() => {
            clearInterval(checkDescription);
        }, 5000);
    }

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    async loadAllProducts() {
        try {
            const response = await fetch('./products.json');
            const data = await response.json();
            
            // Encontrar produto atual para pegar a categoria
            const currentProduct = data.find(p => p.id == this.currentProductId);
            
            if (currentProduct) {
                this.currentCategory = currentProduct.categoria;
            }
            
            // Filtrar produtos: mesma categoria, excluindo o produto atual
            this.allProducts = data.filter(p => 
                p.id != this.currentProductId && 
                (this.currentCategory ? p.categoria === this.currentCategory : true)
            );
            
            // Embaralhar produtos para variedade
            this.allProducts = this.shuffleArray(this.allProducts);
            
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.allProducts = [];
        }
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    createRelatedProductsSection() {
        // Encontrar a descrição do produto
        const descricao = document.querySelector('.produto-descricao');
        
        if (!descricao) return;

        // Criar seção de produtos relacionados
        const section = document.createElement('section');
        section.className = 'produtos-relacionados-section';
        section.innerHTML = `
            <div class="produtos-relacionados-header">
                <h2>Produtos Relacionados</h2>
                <p>Você também pode gostar destes produtos</p>
            </div>
            <div id="produtos-relacionados-grid" class="produtos-relacionados-grid">
                <!-- Produtos serão carregados aqui -->
            </div>
            <div id="relacionados-loader" class="relacionados-loader" style="display: none;">
                <div class="spinner"></div>
                <p>Carregando mais produtos...</p>
            </div>
        `;

        // Inserir DEPOIS da descrição do produto
        descricao.parentNode.insertBefore(section, descricao.nextSibling);
    }

    renderPage() {
        if (this.isLoading || !this.hasMoreItems) return;
        
        this.isLoading = true;
        this.showLoader();
        
        // Calcular índices
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        // Pegar produtos da página
        const pageProducts = this.allProducts.slice(startIndex, endIndex);
        
        if (pageProducts.length === 0) {
            this.hasMoreItems = false;
            this.hideLoader(true);
            return;
        }

        // Simular delay de carregamento
        setTimeout(() => {
            this.appendProducts(pageProducts);
            this.currentPage++;
            this.isLoading = false;
            this.hideLoader(false);
            
            // Verificar se há mais produtos
            if (endIndex >= this.allProducts.length) {
                this.hasMoreItems = false;
                this.showEndMessage();
            }
        }, 500);
    }

    appendProducts(products) {
        const grid = document.getElementById('produtos-relacionados-grid');
        if (!grid) return;

        products.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'produto-relacionado-card fade-in-up';
        
        const discount = product.discount || 0;
        const discountHTML = discount > 0 ? `<span class="produto-badge">${discount}% OFF</span>` : '';
        
        card.innerHTML = `
            <a href="produto.html?id=${product.id}" class="produto-relacionado-link">
                <div class="produto-relacionado-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${discountHTML}
                </div>
                <div class="produto-relacionado-info">
                    <h3 class="produto-relacionado-title">${product.name}</h3>
                    <div class="produto-relacionado-price">
                        R$ ${Number(product.price).toFixed(2).replace('.', ',')}
                    </div>
                    <button class="produto-relacionado-btn">Ver Produto</button>
                </div>
            </a>
        `;
        
        return card;
    }

    setupIntersectionObserver() {
        const sentinel = document.createElement('div');
        sentinel.id = 'relacionados-sentinel';
        sentinel.style.height = '20px';
        
        const grid = document.getElementById('produtos-relacionados-grid');
        if (grid) {
            grid.parentElement.appendChild(sentinel);
        }
        
        const options = {
            root: null,
            rootMargin: '200px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading && this.hasMoreItems) {
                    this.renderPage();
                }
            });
        }, options);
        
        observer.observe(sentinel);
    }

    handleScroll() {
        if (this.isLoading || !this.hasMoreItems) return;
        
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - 400) {
            this.renderPage();
        }
    }

    showLoader() {
        const loader = document.getElementById('relacionados-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    hideLoader(isEnd) {
        const loader = document.getElementById('relacionados-loader');
        if (loader && !isEnd) {
            loader.style.display = 'none';
        }
    }

    showEndMessage() {
        const loader = document.getElementById('relacionados-loader');
        if (loader) {
            loader.innerHTML = '<p class="end-message"></p>';
            loader.style.display = 'flex';
            
            setTimeout(() => {
                loader.style.display = 'none';
            }, 3000);
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ProdutoInfiniteScroll();
});








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