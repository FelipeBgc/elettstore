//ANIMAÇÃO SLIDE

let count = 1;
document.getElementById("radio1").checked = true;

setInterval( function(){
    nextImage()
}, 4000)

function nextImage(){
    count++;
    if(count>4){
        count = 1;
    }

    document.getElementById("radio"+count).checked = true;
}


//LISTA NA PESQUISA

const searchInput = document.getElementById("search");

searchInput.addEventListener('input', (event) => {
    const value = formatString(event.target.value);

    const items = document.querySelectorAll('.container-li .item');
    const noResults = document.getElementById('no_results');
    const box = document.querySelectorAll('.li');

    let hasResults = false

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

function formatString(value) {
    return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'');
}

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
    
    const searchLi = new SearchLi(
        ".search-box",
        ".li",
        ".li li",
    );
    
    searchLi.init();