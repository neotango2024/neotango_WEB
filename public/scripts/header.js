import {form, button} from './componentRenderer.js';
import { userLogged } from './checkForUserLogged.js';
import { translations } from '../constants/constants.js';
import { getItem } from './localStorage.js';
import { languages } from '../constants/constants.js';
import { toggleBodyScrollableBehavior, toggleOverlay } from './utils.js';
const {english, spanish} = languages;
const headerTranslations  = translations['header'];
const categoriesTranslations = translations['categories'];
const formTranslations = translations['userForm'];

const SCREEN_WIDTH = window.innerWidth;

window.addEventListener('DOMContentLoaded', () => {
    if(SCREEN_WIDTH < 720){
        checkForNavbarClicks();
        checkForShopDropdownClicks();
    }
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



const checkForUserIconClicks = () => {
    const userIcon = document.querySelector('.user-icon');
    userIcon.addEventListener('click', () => {
        if(!userLogged){
            toggleLoginModal();
        } else {
            // TODO - REDIRECT TO USER PROFILE
        }
    })
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

const renderFormAndButton = () => {
    const localStorageItem = getItem('language');
    const settedLanguage = userLogged && userLogged.language ? userLogged.language : localStorageItem ? localStorageItem : null;

    const inputProps = [
        {
            placeholder: 'Email',
            name: 'email',
            required: true,
            width: 75,
        },
        {
            placeholder: settedLanguage === english  ? 'Password' : 'Contraseña',
            name: 'password',
            type: 'password',
            className: 'pasword-input',
            required: true,
            width: 75,
            datasetObject: {
                dataKey: 'translation',
                dataValue: 'password'
            }
        }
    ];
    const formTitleObject = {
        title: settedLanguage === english  ? 'Sign in' : 'Iniciar sesión',
        datasetObject: {
            dataKey: 'translation',
            dataValue: 'title'
        }
    }
    const formAction = '/user/login';
    const formProps = {
        inputProps,
        formTitleObject,
        formAction,
    }
    form(formProps);

    const buttonProps = {
        text: settedLanguage === english ? 'Sign in' : 'Iniciar sesión',
        width: 75,
        fontSize: 100,
        container: 'custom-form',
        datasetObject: {
            dataKey: 'translation',
            dataValue: 'signIn'
        }
    }
    button(buttonProps);
}

export const translateNavbar = (language) => {
    const linksContent = document.querySelectorAll('.page-link-item');
    linksContent.forEach((link) => {
        const isMobileShopItem = link.querySelector('.shop-mobile-span');
        if(isMobileShopItem){
            const mobileShopSpan = isMobileShopItem;
            const linkDataset = mobileShopSpan.dataset.translation;
            const translation = headerTranslations[linkDataset]?.[language];
            mobileShopSpan.textContent = translation;
            const shopItems = document.querySelectorAll('.shop-category-item a');
            const menDataset = shopItems[0].dataset.translation;
            const womenDataset = shopItems[1].dataset.translation;
            shopItems[0].textContent = translations.categories[menDataset]?.[language];
            shopItems[1].textContent = translations.categories[womenDataset]?.[language];
        } else {
            const itemAnchor = link.querySelector('a');
            const linkDataset = itemAnchor.dataset.translation;
            const translation = headerTranslations[linkDataset]?.[language];
            itemAnchor.textContent = translation;
        }

    });
}
