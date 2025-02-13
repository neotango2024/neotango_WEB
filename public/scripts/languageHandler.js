import { paintUserIconOrLetter, translateNavbar, translateUserLoggedModal } from "./header.js";
import { handleTranslateFeatureProducts, translateCompanyInfo } from "./index.js";
import {setLocalStorageItem, getLocalStorageItem} from './localStorage.js';
import { checkForUserLogged, userLogged } from "./checkForUserLogged.js";
import { productsFromDB, toggleBodyScrollableBehavior, toggleOverlay } from './utils.js';
import { cartExportObj } from "./cart.js";
import { productDetailExportObj } from "./productDetail.js";
import { handleTranslateCategoryProducts, translateCategoryTitle, translateFilters } from "./productList.js";
import { userProfileExportObj } from "./userProfile.js";
import { translateAboutUsContent } from "./aboutUs.js";
import { translateFaqContent } from "./faq.js";

export let settedLanguage = null;
export let isInSpanish = true;

window.addEventListener('DOMContentLoaded', async () => {
    await checkForUserLogged();
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
        const idSelector = imgElement.getAttribute('id');//1: mp o 2: paypal
        handleChangeLanguage(idSelector); 
        toggleLanguagesModalClasses();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    }));
    
}

//Se ejecuta cuando carga la pagina para ver que idioma esta establecido
export const decideLanguageInsertion = () => {
    const localStorageItem = getLocalStorageItem('payment_type_id');
    const languageToSetID = userLogged  ? userLogged.payment_type_id : localStorageItem ? localStorageItem : null;
    if(languageToSetID) {
        handleChangeLanguage(languageToSetID)
    } else {
        //Te abre el modal para que se elija el pais
        toggleLanguagesModalClasses();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    }
};

//Agarra los src de las imagenes del modal
const handleChangeLanguage = async(param) => { //param es 1/2    
    await updateLanguage(param); //Updateo tanto en localStorage como en la variable que se comparte 
    //Agarro las banderas del modal
    const modalImgs = document.querySelectorAll('.modal-flag-container img');
    modalImgs.forEach(img => {
        const idSelector = img.getAttribute('id');
        if(idSelector == param){
            const imgSrc = img.getAttribute('src');
            const activeImg = document.querySelector('.active-flag');
            activeImg.src = imgSrc
        }
    });                                  
    
    const bodyName = document.querySelector('body').dataset.page_name;    
    translateNavbar();
    paintUserIconOrLetter()
    switch (bodyName) {
        case 'index': //Van todos los cambios de index
            translateCompanyInfo();
            handleTranslateFeatureProducts(param);
            break;
            case 'cart': //Van todos los cambios de cart
            //Aca tengo que pintar denuevo cards y detalle y form
            cartExportObj.pageConstructor && await cartExportObj.pageConstructor();
            break;
        case 'productDetail': //Aca repinto el detalle
            productsFromDB.length && productDetailExportObj.createProductDetailsSection(productsFromDB[0]);
            productDetailExportObj.paintRelatedProductCards && productsFromDB && productDetailExportObj.paintRelatedProductCards();
            break;
        case 'category':
            translateCategoryTitle();
            translateFilters();
            handleTranslateCategoryProducts();
            break
        case 'profile':
            userProfileExportObj.pageConstructor && userProfileExportObj.pageConstructor();
            // translateUserLabels();
           break
        case "aboutUs":
            translateAboutUsContent();
            break;
        case "faq":
            translateFaqContent();
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
const updateLanguage = async (lang)=>{
    const previousLanguageIDSelected = userLogged ? userLogged.payment_type_id : getLocalStorageItem('payment_type_id') || null;
    isInSpanish = lang == 1; // 1 es esp
    if(previousLanguageIDSelected == lang) return;
    //Aca es para cambiar o bien en localStorage o en db el usuario
    if(userLogged){        
        //Aca hago un fetch a db para cambiar el payment_type_id del user
        let response = await fetch(`/api/user/change-language/${userLogged.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                payment_type_id: lang
            }),
        });
        
        if(response.ok){
            userLogged.payment_type_id = lang
        }
    } else{
        setLocalStorageItem('payment_type_id', lang); //Seteo en base al parametro el lenguaje
    }
    
}

export const translateProductCards = (container) => {
    const items = [...container.children];
    items.forEach(item => {
      const {productId} = item.dataset;
      const productInDb = productsFromDB.find(prod => prod.id === productId);
      const productNameElement = item.querySelector('.product-name');
      const productPriceElement = item.querySelector('.product-price');
      productNameElement.textContent = isInSpanish ? productInDb.es_name : productInDb.eng_name;
      productPriceElement.textContent = isInSpanish ? productInDb.ars_price : productInDb.usd_price;
    })
}

