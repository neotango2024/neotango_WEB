import {  productCard, checkoutCard } from "./componentRenderer.js";
import { checkCheckoutButtons } from "./utils.js";
import { languages, translations } from "../constants/constants.js";
const SCREEN_WIDTH = window.innerWidth;
const companyInfoTranslations = translations.companyInfo;

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
   
    //renderProducts();
    //renderCheckoutCard()

    const slides = document.querySelectorAll('.slider-img-container');
  const dotsContainer = document.querySelector('.dots-container');


  let currentImage = 0;
  let slidesLength = slides.length;


  const carouselInterval = setInterval(handleCarouselActualImage, 3000);
  const dotsInterval = setInterval(dotsNextSlide, 3001);

  handleCarouselImgClasses()

  function handleCarouselImgClasses() {
    slides.forEach((img, i) => { // function that adds or removes the class of an image
      if (i == currentImage) {
        img.classList.add('active');
        img.classList.remove('prev-slide');
        img.classList.remove('next-slide');
      } else if (i == currentImage - 1 || (currentImage == 0 && i == slidesLength - 1)) {
        img.classList.remove('active');
        img.classList.remove('next-slide');
        img.classList.add('prev-slide');
      } else {
        img.classList.remove('active');
        img.classList.remove('prev-slide');
        img.classList.add('next-slide');
      }
    })
  }

  function handleCarouselActualImage() {
    if (currentImage < slidesLength - 1) { // function that handles the maths of the actual image. 
      // this function just redeclares the image based on the condition
      // whether is the last dot or not
      currentImage += 1;
    } else {
      currentImage = 0 
    }
    return handleCarouselImgClasses()
  }

  for (let i = 0; i < slidesLength; i++) {
    if (i == 0) {
      dotsContainer.innerHTML += "<div class='home-slider-dot dot-active'></div>";
    } else {
      dotsContainer.innerHTML += "<div class='home-slider-dot'></div>";
    }
  }

  const dots = document.querySelectorAll('.home-slider-dot');
  // i needed to declare the dots here because of the for because if not it came undefined


  dotsJump()


  function dotsNextSlide() {
    const activeDot = document.querySelector('.dot-active')
    activeDot.classList.remove('dot-active')
    if (activeDot.nextElementSibling) {
      const dotToActive = activeDot.nextElementSibling;
      dotToActive.classList.add('dot-active')
    } else {
      dots[0].classList.add('dot-active')
    }
  }


  function dotsJump() {
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        if (!dot.classList.contains('dot-active')) {
          const activeDot = document.querySelector('.dot-active')
          activeDot.classList.remove('dot-active')
          dot.classList.add('dot-active')
          currentImage = i;
          handleCarouselImgClasses()
          clearInterval(carouselInterval)
          clearInterval(dotsInterval)
        }
      })
    })
  }
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

export const translateCompanyInfo = (selectedLanguage) => {
  const infoItemContainers = document.querySelectorAll('.info-item-container');
  infoItemContainers.forEach(item => {
    const itemDataset = item.dataset.translation;
    const itemTitle = item.querySelector('.info-title');
    const itemDesc = item.querySelector('.info-description');
    itemTitle.textContent = companyInfoTranslations?.[itemDataset]?.[selectedLanguage];
    itemDesc.textContent = companyInfoTranslations?.[itemDataset]?.description?.[selectedLanguage];
  })
}