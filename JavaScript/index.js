// LISTA 3 PONTINHOS

class MobileNavbar { 
    constructor(mobileMenu, navList, navLinks) {
        this.mobileMenu = document.querySelector(mobileMenu);
        this.navList = document.querySelector(navList);
        this.navLinks = document.querySelectorAll(navLinks);
        this.activeClass = "active";
        
        this.handleClick = this.handleClick.bind(this);

        }

        // animação dos links do menu
        animateLinks() {
            this.navLinks.forEach((link) => {
            link.style.animation
                ? (link.style.animation = "")
                : (link.style.animation = `navLinkFade 0.5s ease forwards 0.3s`);
            });
        }

        // alternar o menu
        handleClick() {
            this.navList.classList.toggle(this.activeClass);
            this.animateLinks();
        }

        // evento de clique no menu
        addClickEvent() {
            this.mobileMenu.addEventListener("click", this.handleClick);
        }

        // inicializar o objeto
        init() {
            if(this.mobileMenu) {
                this.addClickEvent();
            }
            return this;
        }
    }
    
    // criando o objeto e iniciando o menu
    const mobileNavbar = new MobileNavbar(
        ".mobile-menu",
        ".nav-list",
        ".nav-list li",
    );
    
    mobileNavbar.init();



    //ANIMAÇÃO SLIDE

//SLIDE AUTOMÁTICO
let count = 1;
document.getElementById("radio1").checked = true;

setInterval( function(){
    nextImage()
}, 5000)

//FUNÇÃO PARA PRÓXIMA IMAGEM
function nextImage(){
    count++;
    if(count>4){
        count = 1;
    }
 //seleciona o radio correspondente à imagem
 //ativa o radio
    document.getElementById("radio"+count).checked = true;
}



//LISTA NA PESQUISA


// obtendo o input de busca
const searchInput = document.getElementById("search");

// adicionando evento de input
searchInput.addEventListener('input', (event) => {
    const value = formatString(event.target.value);

    // obtendo os itens da lista
    const items = document.querySelectorAll('.container-li .item');
    const noResults = document.getElementById('no_results');
    const box = document.querySelectorAll('.li');

    // variável para verificar se há resultados
    let hasResults = false

    // iterando sobre os itens da lista
    // verificando se o título do item contém o valor buscado
    // exibindo ou ocultando o item conforme o resultado da busca
    // exibindo mensagem de "nenhum resultado encontrado" se não houver resultados
    // ou ocultando a mensagem se houver resultados
    if(value != '') {
    items.forEach(item => {
        const itemTitle = item.querySelector('.titulo-produto-li').textContent
        if(formatString(itemTitle).indexOf(value) != -1) {
            item.style.display = 'flex';
            
            hasResults = true
        }  else {
            item.style.display = 'none';
        }
    })

    if (hasResults) {
        noResults.style.display = 'none';
    }   else {
        noResults.style.display = 'block';
    }
    
        }  else{
            items.forEach(item => item.style.display = 'none');

            noResults.style.display = 'none';
        }

        
});


// função para formatar strings (remover acentos, espaços e deixar em minúsculo)
function formatString(value) {
    return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'');
}

// ANIMAÇÃO DA LISTA DE PESQUISA
class SearchLi {
    constructor(searchBox, li, itemLinks,search) {
        this.searchBox = document.querySelector(searchBox);
        this.li = document.querySelector(li);
        this.itemLinks = document.querySelectorAll(itemLinks);
        this.activeClass = "active";

        this.handleClick = this.handleClick.bind(this);

        }

        animateLinks() {
            this.itemLinks.forEach((link) => {
            link.style.animation
                ? (link.style.animation = "")
                : (link.style.animation = `itemLinkFade 0.5s ease forwards 0.3s`);
            });
        }

        handleClick() {
            this.li.classList.toggle(this.activeClass);
            this.animateLinks();
        }

        addClickEvent() {
            this.searchBox.addEventListener("click", this.handleClick);
        }

        init() {
            if(this.searchBox) {
                this.addClickEvent();
            }
            return this;
        }
    }
    

    // iniciando a animação da lista de pesquisa
    const searchLi = new SearchLi(
        ".search-box",
        ".li",
        ".li li",
    );
    
    searchLi.init();

// carregando produtos do arquivo JSON e adicionando à lista de pesquisa
    document.addEventListener('DOMContentLoaded', () => {
    const listWrapper = document.querySelector('.li');
    if (!listWrapper) return;

    let listContainer = listWrapper.querySelector('.container-li');
    if (!listContainer) {
        listContainer = document.createElement('ul');
        listContainer.className = 'container-li';
        listWrapper.prepend(listContainer);
    }

    fetch('products.json')
        .then(response => response.json())
        .then(produtos => {
            listContainer.innerHTML = '';

            produtos.forEach(produto => {
                const li = document.createElement('li');
                li.className = 'item';

                const imagem = Array.isArray(produto.images) && produto.images.length
                    ? produto.images[0]
                    : produto.image;

                const preco = Number(produto.price || 0)
                    .toFixed(2)
                    .replace('.', ',');

                li.innerHTML = `
                    <a href="produto.html?id=${produto.id}">
                        <div class="img-produto-li">
                            <img src="${imagem}" alt="${produto.name}">
                        </div>
                        <div class="item-content">
                            <h2 class="titulo-produto-li">${produto.name}</h2>
                            <p class="pç-produto">R$ ${preco}</p>
                        </div>
                    </a>
                `;

                listContainer.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar produtos para a pesquisa:', error);
        });
});
