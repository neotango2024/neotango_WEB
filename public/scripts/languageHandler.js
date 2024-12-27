import { translateNavbar } from "./header.js";
import { translateCompanyInfo } from "./index.js";
import {setItem, getItem} from './localStorage.js';
import { userLogged } from "./checkForUserLogged.js";
import { toggleBodyScrollableBehavior, toggleOverlay } from './utils.js';

window.addEventListener('DOMContentLoaded', () => {
    checkForLanguageClick();
    checkForLanguageSelection();
    decideLanguageInsertion()
})

const checkForLanguageClick = () => {
    const activeFlag = document.querySelector('.active-flag-container');
    activeFlag.addEventListener('click', () => {
        toggleLanguagesModal();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    })
    const closeButton = document.querySelector('.close-language-modal');
    closeButton.addEventListener('click', () => {
        toggleLanguagesModal();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    })
}


const checkForLanguageSelection = () => {
    const modalImgs = document.querySelectorAll('.language-container');
    modalImgs.forEach(imgContainer => imgContainer.addEventListener('click', () => {
        const imgElement = imgContainer.querySelector('img');
        const idSelector = imgElement.getAttribute('id');
        handleChangeLanguage(idSelector)
        setItem('language', idSelector)
        toggleLanguagesModal();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    }));
    
}

const decideLanguageInsertion = () => {
    const localStorageItem = getItem('language');
    const settedLanguage = userLogged && userLogged.language ? userLogged.language : localStorageItem ? localStorageItem : null;
    console.log(settedLanguage)
    if(settedLanguage) {
        handleChangeLanguage(settedLanguage)
    } else {
        toggleLanguagesModal();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    }
};

const handleChangeLanguage = (selectedLanguage) => {
    const modalImgs = document.querySelectorAll('.modal-flag-container img');
    modalImgs.forEach(img => {
        const idSelector = img.getAttribute('id');
        if(idSelector === selectedLanguage){
            const imgSrc = img.getAttribute('src');
            const activeImg = document.querySelector('.active-flag');
            activeImg.src = imgSrc
        }
    })
    setItem('language', selectedLanguage);
    translateNavbar(selectedLanguage);
    translateCompanyInfo(selectedLanguage);
}

const toggleLanguagesModal = () => {
    const modal = document.querySelector('.languages-modal');
    modal.classList.toggle('languages-modal-active');
}


