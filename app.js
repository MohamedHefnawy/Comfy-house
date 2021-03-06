//variables
const cartBtn = document.querySelector('.cart-btn');
const closecartBtn = document.querySelector('.close-cart');
const clearcartBtn = document.querySelector('.clear-cart');
const clearDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContant = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');
// cart 
let cart = [];
//
let buttonsDOM = [];




//getting the product
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();

            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }

            })
            return products

        } catch (error) {
            console.log(error)
        }
    }
}

//display product
class UI {
    displayProduct(products) {
        let result = "";
        products.forEach(product => {

            result += `
        <article class="product">
            <div class="img-container"><img src=${product.image} alt="product" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fas fa-shopping-cart"></i>
                    add to bag
                </button>

            </div>
            <h3>${product.title}</h3>
            <h4>${product.price}</h4>

        </article>`
        });
        productDOM.innerHTML = result;

    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        // console.log(buttons);
        buttonsDOM = buttons;

        buttons.forEach(buttons => {

            let id = buttons.dataset.id;
            //   console.log(id);
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                buttons.innerText = "In Cart";
                buttons.disabled = true
            }
            buttons.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get product from products 
                let cartItem = {...Storage.getProduct(id), amount: 1 };
                //add product to cart 
                cart = [...cart, cartItem];
                //save the cart in local storage 
                Storage.saveCart(cart);
                //set cart values 
                this.setCartValues(cart);
                //display cart item
                this.addCartItem(cartItem);
                //show the cart 
                this.showCart();
            });
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
            //console.log(tempTotal, itemsTotal);
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
            // cartTotal.innerText = tempTotal;
        cartItems.innerText = itemsTotal;
        //console.log(cartTotal, cartItems);
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="product"/>
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-items" data-id=${item.id}> remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount"> ${item.amount}</p>
            <i class=" fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContant.appendChild(div);
        // console.log(cartContant);
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        clearDOM.classList.add("showCart");
    }
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        clearDOM.classList.remove("showCart");

    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closecartBtn.addEventListener('click', this.hideCart);

    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));

    }
    cartLogic() {
        clearcartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        cartContant.addEventListener('click', event => {
            //console.log(event.target);
            if (event.target.classList.contains("remove-items")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContant.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);

            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;


            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);

                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContant.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }

            }
        });
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContant.children.length > 0) {
            cartContant.removeChild(cartContant.children[0])
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSinglebutton(id);
        button.disabled = false;
        button.innerHTML = `<i class=fas fa-shopping-cart></i> add to bag`;
    }
    getSinglebutton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
//localStorage
class Storage {
    static saveProduct(products) {
        localStorage.setItem("products", JSON.stringify(products));

    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    //setup application
    ui.setupAPP();

    products.getProducts().then(products => {
        ui.displayProduct(products);
        Storage.saveProduct(products);

    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});