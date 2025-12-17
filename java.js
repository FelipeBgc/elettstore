let cartCount = 0;
const addToCartButton = document.querySelector(".add-to-cart");
const cartCountElement = document.getElementById("cart-count");

addToCartButton.addEventListener("click", () => {
  cartCount++;
  cartCountElement.textContent = cartCount;

  addToCartButton.textContent = "Added to Cart";
  addToCartButton.style.backgroundColor = "#45a049";

  setTimeout(() => {
    addToCartButton.textContent = "Add to Cart";
    addToCartButton.style.backgroundColor = "#4CAF50";
  }, 2000);
});
