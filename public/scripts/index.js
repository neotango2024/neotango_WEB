import { addressCard, checkoutCard } from "./componentRenderer.js";
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
    ];
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
    const addresWrapper = document.querySelector('.main');
    addresWrapper.innerHTML = '';
    addressList.forEach(address => {
        let card = addressCard({
            id: address.id,
            name: address.name,
            street: address.street,
            detail: address.detail,
            zip: address.zip,
            city: address.city,
            country: address.country,
            default: address.default
        });        
        addresWrapper.appendChild(card);
        
    });
    // checkCheckoutButtons();
});