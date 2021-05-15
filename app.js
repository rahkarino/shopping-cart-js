const productsDOM = document.querySelector('.products-center')
const cartCount = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const closeCart = document.querySelector('.close-cart')
const cartBtn = document.querySelector('.cart-btn')
const clearCart = document.querySelector('.clear-cart')

let cart = []

// get data from json
class Product {
    async getProduct() {
       try {
            const result = await fetch('products.json')
            const data = await result.json()
            let products = data.items
            products = products.map(product => {
                const {title, price} = product.fields
                const {id} = product.sys
                const image = product.fields.image.fields.file.url
                return {title, price, id, image}
            })
            return products
       }
       catch(x) {
        console.log(x)
       }
    }
}

// display data in UI
class View {
    displayProducts(products) {
      let result = ''
      products.forEach(item => {
        result += `
            <article class="product">
                <div class="img-container">
                <img src="${item.image}" alt="${item.title}" class="product-img">
                <button class="bag-btn" data-id="${item.id}">افزودن به سبد خرید</button>
                </div>
                <h3>${item.title}</h3>
                <h4>${item.price}</h4>
            </article>
        `
      })
      productsDOM.innerHTML = result
    }
    getCartButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttons.forEach(btn => {
            let id = btn.dataset.id
            btn.addEventListener('click', () => {
                const cartItem = {...Storage.getProduct(id), amount: 1}
                cart = [...cart, cartItem]
                Storage.saveCart(cart)
                this.setCartValues(cart)
                this.addCartItem(cartItem)
                this.displayCart()
            })
        })
    }
    setCartValues(cart) {
        let totalPrice = 0
        let totalCount = 0
        cart.map(item => {
            totalPrice = totalPrice + item.amount * item.price
            totalCount = totalCount + item.amount
        })
        cartCount.innerText = totalCount
        cartTotal.innerText = totalPrice
    }
    addCartItem(item) {
        const itemDiv = document.createElement('div')
        itemDiv.classList.add('cart-item')
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div>
                <h4>${item.title}</h4>
                <h5>${item.price}</h5>
                <span class="remove-item" data-id="${item.id}">حذف</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id="${item.id}"></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id="${item.id}"></i>
            </div>
        `
        cartContent.appendChild(itemDiv)
    }
    displayCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }
    initApp() {
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populate(cart)
        closeCart.addEventListener('click', this.hideCart)
        cartBtn.addEventListener('click', this.displayCart)
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }
    populate(cart) {
        cart.forEach(item => {
            return this.addCartItem(item)
        })
    }
    cartProcess() {
        clearCart.addEventListener('click', () => {
          this.clearCart()
        })
        cartContent.addEventListener('click', e => {
            let itemId = e.target.dataset.id
            if(e.target.classList.contains('remove-item')) {  
                cartContent.removeChild(e.target.parentElement.parentElement)
                this.removeProduct(itemId)
            }
            else if(e.target.classList.contains('fa-chevron-up')) {
                let product = cart.find(item => {
                    return item.id === itemId
                })
                product.amount = product.amount + 1
                Storage.saveCart(cart)
                this.setCartValues(cart)
                e.target.nextElementSibling.innerText =  product.amount 
            }
            else if(e.target.classList.contains('fa-chevron-down')) {
                let product = cart.find(item => {
                    return item.id === itemId
                })
                product.amount = product.amount - 1
                if(product.amount > 0) {
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    e.target.previousElementSibling.innerText =  product.amount 
                }    
            }
        })
    }
    clearCart() {
        let cartItems = cart.map(item => {
            return item.id
        })
        cartItems.forEach(item => {
            return this.removeProduct(item)
        })
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
    }
    removeProduct(id) {
        cart = cart.filter(item => {
            return item.id !== id
        })
        this.setCartValues(cart)
        Storage.saveCart(cart)
    }
}

// save product info
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }
    static getProduct(id) {
        const products = JSON.parse(localStorage.getItem('products'))
        return products.find(item => item.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') 
        ? 
        JSON.parse(localStorage.getItem('cart'))
        :
        []
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const view = new View()
    const product = new Product()
    view.initApp()
    product.getProduct().then(data => {
        view.displayProducts(data)
        Storage.saveProducts(data)
    }). then(() => {
        view.getCartButtons()
        view.cartProcess()
    })
})