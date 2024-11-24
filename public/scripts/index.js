import {  productCard, checkoutCard } from "./componentRenderer.js";
import { checkCheckoutButtons } from "./utils.js";
//import { LANGUAGES } from "../../src/utils/staticDB/constants.js";
const SCREEN_WIDTH = window.innerWidth;

const products = [
    {
    "name": "Ladeado Cuero negro negro negr",
    "price": 180,
    "quantity": 3,
    "category": "Zapatos Mujer",
    "filename": "IMG_5490.png"
    },
    {
    "name": "Zapato Clásico 2",
    "price": 250,
    "quantity": 1,
    "category": "Botines",
    "filename": "IMG_5492.png"
    },
    {
    "name": "Zapato Moderno 3",
    "price": 130,
    "quantity": 4,
    "category": "Deportivos",
    "filename": "IMG_5496.png"
    },
    {
        "name": "Zapato Moderno 3",
        "price": 130,
        "quantity": 4,
        "category": "Deportivos",
        "filename": "IMG_5495.png"
    },
    {
        "name": "Zapato Moderno 3",
        "price": 130,
        "quantity": 4,
        "category": "Deportivos",
        "filename": "IMG_5490.png"
    },
    {
        "name": "Zapato Moderno 5",
        "price": 130,
        "quantity": 4,
        "category": "Deportivos",
        "filename": "IMG_5496.png"
    },
    {
        "name": "Zapato Moderno 5",
        "price": 130,
        "quantity": 4,
        "category": "Deportivos",
        "filename": "IMG_5492.png"
    },
    {
        "name": "Zapato Moderno 5",
        "price": 130,
        "quantity": 4,
        "category": "Deportivos",
        "filename": "IMG_5506.png"
    },
    {
        "name": "Zapato Moderno 5",
        "price": 130,
        "quantity": 4,
        "category": "Deportivos",
        "filename": "IMG_5506.png"
    },
];


window.addEventListener('load',()=>{
    
    const addressList = [
        {
            id: '1',
            name: 'Casa',
            street: 'Av. Libertador 1555',
            detail: '6to B',
            zip: '1429',
            city: 'Buenos Aires',
            country: 'Argentina',
            default: false
        },
        {
            id: '2',
            name: 'Oficina',
            street: 'Calle Corrientes 200',
            detail: 'Piso 12',
            zip: '1043',
            city: 'Buenos Aires',
            country: 'Argentina',
            default: false
        },
        {
            id: '3',
            name: 'Casa de Verano',
            street: 'Av. del Mar 550',
            detail: '',
            zip: '7600',
            city: 'Mar del Plata',
            country: 'Argentina',
            default: true
        },
        {
            id: '4',
            name: 'Departamento',
            street: 'San Martín 1120',
            detail: '3er A',
            zip: '8300',
            city: 'Neuquén',
            country: 'Argentina',
            default: false
        },
        {
            id: '5',
            name: 'Casa de Familia',
            street: 'Av. Roca 3200',
            detail: '',
            zip: '4600',
            city: 'San Salvador de Jujuy',
            country: 'Argentina',
            default: false
        },
    ];
    let homeLabels = [
        {
            id: 1,
            name: "Formas de pago",
            desc: ["Para las compras dentro de Argentina te ofrecemos depósito o transferencia bancaria o tarjeta de crédito. El pago se realiza a través de Mercado Pago","Para compras internacionales las compras se realizan a través de Paypal"]
        },
        {
            id: 2,
            name: "Envíos",
            desc: ["Los envíos se realizan a través de Andreani"]
        },
        {
            id: 3,
            name: "Cambios",
            desc: ["Dentro de los 30 dias"]
        }
<<<<<<< HEAD
    ];   
    // const addresWrapper = document.querySelector('.main');
    // addresWrapper.innerHTML = '';
    // homeLabels.forEach(label => {
    //     let card = homeLabel({
    //         name: label.name,
    //         desc: label.desc,
    //     });        
    //     addresWrapper.appendChild(card);
    // });
    // activateAccordions();
   
    renderProducts();
    //renderCheckoutCard()
});

const renderCheckoutCard = () => {
    products.forEach(prod => checkoutCard(prod));
}

const renderProducts = () => {
    const main = document.querySelector('.main');
    products.forEach(prod => {
        const card = checkoutCard(prod);
        main.appendChild(card);
    })
    checkCheckoutButtons();
}
