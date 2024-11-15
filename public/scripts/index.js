import { checkoutCard } from "./componentRenderer.js";
import { checkCheckoutButtons } from "./utils.js";

window.addEventListener('load',()=>{
    
    let products = [
        {
        "name": "Zapato Tango 1",
        "price": 180,
        "quantity": 3,
        "category": "Zapatos Mujer",
        "filename": "/img/product/shoe_1.png"
        },
        {
        "name": "Zapato Clásico 2",
        "price": 250,
        "quantity": 1,
        "category": "Botines",
        "filename": "/img/product/shoe_1.png"
        },
        {
        "name": "Zapato Moderno 3",
        "price": 130,
        "quantity": 4,
        "category": "Deportivos",
        "filename": "/img/product/shoe_1.png"
        },
        {
        "name": "Zapato Elegante 4",
        "price": 200,
        "quantity": 2,
        "category": "Sandalias",
        "filename": "/img/product/shoe_1.png"
        },
        {
        "name": "Zapato Casual 5",
        "price": 300,
        "quantity": 5,
        "category": "Zapatos Hombre",
        "filename": "/img/product/shoe_1.png"
        }
    ]
    const productWrapper = document.querySelector('.main');
    productWrapper.innerHTML = '';
    products.forEach(prod => {
        let card = checkoutCard({
            name: prod.name,
            price: prod.price,
            category: prod.category,
            filename: prod.filename || 'default.png',
            quantity: prod.quantity || 1,
        });        
        productWrapper.appendChild(card);
        
    });
    checkCheckoutButtons();
});