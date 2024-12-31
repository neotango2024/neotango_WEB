import { translateNavbar } from "./header.js";
import { translateCompanyInfo } from "./index.js";
import {setLocalStorageItem, getLocalStorageItem} from './localStorage.js';
import { userLogged } from "./checkForUserLogged.js";
import { productFromDB, productsFromDB, toggleBodyScrollableBehavior, toggleOverlay } from './utils.js';
import { cartExportObj } from "./cart.js";
import { productDetailExportObj } from "./productDetail.js";

export let settedLanguage = null;
export let isInSpanish = true;

window.addEventListener('DOMContentLoaded', () => {
    checkForLanguageClick();
    checkForLanguageSelection();
    decideLanguageInsertion();
})
//TOCA BANDERA: settedLang || llama a la funcion que cambia las cosas
//Esta funcion captura cuando toca la bandera de arriba o el btn de cerra menu
const checkForLanguageClick = () => {
    const activeFlag = document.querySelector('.active-flag-container');
    activeFlag.addEventListener('click', () => {
        toggleLanguagesModalClasses();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    })
    const closeButton = document.querySelector('.close-language-modal');
    closeButton.addEventListener('click', () => {
        toggleLanguagesModalClasses();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    })
}


const checkForLanguageSelection = () => {
    const modalImgs = document.querySelectorAll('.language-container');
    modalImgs.forEach(imgContainer => imgContainer.addEventListener('click', () => {
        const imgElement = imgContainer.querySelector('img');
        const idSelector = imgElement.getAttribute('id');//eng o esp
        handleChangeLanguage(idSelector); 
        toggleLanguagesModalClasses();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    }));
    
}

//Se ejecuta cuando carga la pagina para ver que idioma esta establecido
const decideLanguageInsertion = () => {
    const localStorageItem = getLocalStorageItem('language');
    const languageToSet = userLogged && userLogged.language ? userLogged.language : localStorageItem ? localStorageItem : null;
    if(languageToSet) {
        handleChangeLanguage(languageToSet)
    } else {
        //Te abre el modal para que se elija el pais
        toggleLanguagesModalClasses();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    }
};

//Agarra los src de las imagenes del modal
const handleChangeLanguage = async(param) => { //param es esp/eng
    updateLanguage(param); //Updateo tanto en localStorage como en la variable que se comparte 
    //Agarro las banderas del modal
    const modalImgs = document.querySelectorAll('.modal-flag-container img');
    modalImgs.forEach(img => {
        const idSelector = img.getAttribute('id');
        if(idSelector === param){
            const imgSrc = img.getAttribute('src');
            const activeImg = document.querySelector('.active-flag');
            activeImg.src = imgSrc
        }
    });                                  
    
    const bodyName = document.querySelector('body').dataset.page_name;    
    translateNavbar();
    switch (bodyName) {
        case 'index': //Van todos los cambios de index
            translateCompanyInfo();
            break;
        case 'cart': //Van todos los cambios de cart
            //Aca tengo que pintar denuevo cards y detalle y form
            cartExportObj.generateCheckoutForm && await cartExportObj.generateCheckoutForm();
            cartExportObj.setDetailContainer && cartExportObj.setDetailContainer();
            break;
        case 'productDetail': //Aca repinto el detalle
            productFromDB && productDetailExportObj.createProductDetailsSection(productFromDB);
            productDetailExportObj.paintRelatedProductCards && productsFromDB && productDetailExportObj.paintRelatedProductCards();
            break;
    
        default:
            break;
    }
   
    
}

//Activa/descativa el modal
const toggleLanguagesModalClasses = () => {
    const modal = document.querySelector('.languages-modal');
    modal.classList.toggle('languages-modal-active');
}

//Cambia las variables
const updateLanguage = (lang)=>{
    setLocalStorageItem('language', lang); //Seteo en base al parametro el lenguaje
    settedLanguage = lang;
    isInSpanish = settedLanguage == 'esp';
}

