const shopping_cart = document.querySelector('.shopping-cart');
const cart_btns = document.querySelectorAll('.add-to-cart');


for (cart_btn of cart_btns) {
    cart_btn.onclick = (e) => {

        shopping_cart.classList.add('active');

        let product_count = Number(shopping_cart.getAttribute('data-product-count')) || 0;
        shopping_cart.setAttribute('data-product-count', product_count + 1);

        // finding first grand parent of target button 
        let target_parent = e.target.parentNode.parentNode.parentNode;
        target_parent.style.zIndex = "100";
        // Creating separate Image
        let img = target_parent.querySelector('img');
        let flying_img = img.cloneNode();
        flying_img.classList.add('flying-img');

        target_parent.appendChild(flying_img);

        // Finding position of flying image

        const flying_img_pos = flying_img.getBoundingClientRect();
        const shopping_cart_pos = shopping_cart.getBoundingClientRect();

        let data = {
            left: shopping_cart_pos.left - (shopping_cart_pos.width / 2 + flying_img_pos.left + flying_img_pos.width / 2),
            bottom: shopping_cart_pos.bottom - flying_img_pos.right + 30
        }

        console.log(data.bottom);

        flying_img.style.cssText = `
                                --left : ${data.left.toFixed(2)}px;
                                --bottom : ${data.bottom.toFixed(2)}px;
                                `;


        setTimeout(() => {
            target_parent.style.zIndex = "";
            target_parent.removeChild(flying_img);
            shopping_cart.classList.remove('active');
        }, 1000);
    }
}

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


const searchInput = document.getElementById("search");

searchInput.addEventListener('input', (event) => {
    const value = formatString(event.target.value);

    const items = document.querySelectorAll('.container-li .item');
    const noResults = document.getElementById('#no_results');

    let hasResults = false

    if(value != '') {
    items.forEach(item => {
        const itemTitle = item.querySelector('.titulo-produto-li').textContent
        if(formatString(itemTitle).indexOf(value) !== -1) {
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
            items.forEach(item => item.style.display = 'flex');

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