import {form, button} from './componentRenderer.js';
import {setItem, getItem} from './localStorage.js';
import { userLogged } from './checkForUserLogged.js';
import { headerLinksTranslation } from '../constants/constants.js';
import { languages } from '../constants/constants.js';
const {english} = languages;

const SCREEN_WIDTH = window.innerWidth;
const LANGUAGE = getItem('language');

window.addEventListener('DOMContentLoaded', () => {
    if(SCREEN_WIDTH < 720){
        checkForNavbarClicks();
        checkForShopDropdownClicks();
    }
    decideLanguageInsertion();
    checkForLanguageClick();
    checkForLanguageSelection();
    checkForUserIconClicks();
    renderFormAndButton();
})

const checkForNavbarClicks = () => {
    const burgerMenu = document.querySelector('.menu-container');
    burgerMenu.addEventListener('click', () => {
        toggleNavbarMenu();
        toggleBodyScrollableBehavior();
    });
    const closeMenuIcon = document.querySelector('.close-navbar');
    closeMenuIcon.addEventListener('click', () => {
        toggleNavbarMenu();
        toggleBodyScrollableBehavior();
    });
};

const toggleNavbarMenu = () => {
    const menus = document.querySelectorAll('.menu-icon');
    menus.forEach(menu => {
        menu.classList.toggle('hidden');
    })
    const navbar = document.querySelector('.mobile-navbar');
    navbar.classList.toggle('mobile-navbar-active');
};

const decideLanguageInsertion = () => {
    const localStorageItem = getItem('language');
    if(userLogged && userLogged.language){
        translateNavbar(userLogged.language)
        handleChangeLanguage(userLogged.language)
    } else if(localStorageItem){
        translateNavbar(localStorageItem)
        handleChangeLanguage(localStorageItem)
    }
    else {
        toggleLanguagesModal();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    }
};

const translateNavbar = (language) => {
    const linksContent = document.querySelectorAll('.page-link-item a');
    const shopItems = document.querySelectorAll('.shop-category-item a');

    linksContent.forEach((link, index) => {
        const translation = headerLinksTranslation[index]?.[language];
        const isShopItem = headerLinksTranslation[index]?.isShopItem;
        
        if (translation) {
            link.textContent = translation;
        }

        if (isShopItem && shopItems.length >= 2) {
            shopItems[0].textContent = "Men's shoes";
            shopItems[1].textContent = "Women's shoes";
        }
    });
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
        translateNavbar(idSelector);
    }));
    
}

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
}


const checkForShopDropdownClicks = () => {
    const mobileShopDropdownTrigger = document.querySelector('.shop-dropdown-trigger');
    mobileShopDropdownTrigger.addEventListener('click', (e) => {
        toggleShopDropdown();
    })
}

const toggleShopDropdown = () => {
    const dropdown = document.querySelector('.shop-dropdown');
    dropdown.classList.toggle('shop-dropdown-active');
    const arrow = document.querySelector('.shop-arrow');
    arrow.classList.toggle('arrow-active');
}

const toggleLanguagesModal = () => {
    const modal = document.querySelector('.languages-modal');
    modal.classList.toggle('languages-modal-active');
}

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

const toggleOverlay = () => {
    const overlay = document.querySelector('.overlay');
    overlay.classList.toggle('overlay-active')
}

const checkForUserIconClicks = () => {
    const userIcon = document.querySelector('.user-icon');
    userIcon.addEventListener('click', () => {
        const isUserLogged = checkUserLogged();
        if(!isUserLogged){
            toggleLoginModal();
        } else {
            // TODO - REDIRECT TO USER PROFILE
        }
    })
    let userLogged = false;
}

const checkForLoginModalCloseClicks = () => {
    const closeBtn = document.querySelector('.close-sign-in-modal');
    closeBtn.addEventListener('click', () => {
        console.log('click')
        toggleLoginModal();
    })
}

const toggleLoginModal = () => {
    const modal = document.querySelector('.no-logged-user-modal');
    console.log(modal)
    modal.classList.toggle('no-logged-user-modal-active');
    console.log(modal)
    if(SCREEN_WIDTH < 1024){
        toggleBodyScrollableBehavior();
        toggleOverlay();
    }
}

const toggleBodyScrollableBehavior = () => {
    const body = document.querySelector('body');
    body.classList.toggle('non-scrollable');
}

const renderFormAndButton = () => {
    const isEnglishLanguage = LANGUAGE === 'English';
    const inputProps = [
        {
            placeholder: 'Email',
            name: 'email',
            required: true,
            width: 75
        },
        {
            placeholder: isEnglishLanguage ? 'Password' : 'Contraseña',
            name: 'password',
            type: 'password',
            className: 'pasword-input',
            required: true,
            width: 75
        }
    ];
    const formTitle = isEnglishLanguage ? 'Sign in' : 'Iniciar sesión';
    const formAction = '/user/login';
    const formProps = {
        inputProps,
        formTitle,
        formAction
    }
    form(formProps);

    const buttonProps = {
        text: isEnglishLanguage ? 'Sign in' : 'Iniciar sesión',
        width: 75,
        fontSize: 100,
        container: 'custom-form'
    }
    button(buttonProps);
}