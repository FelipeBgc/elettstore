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