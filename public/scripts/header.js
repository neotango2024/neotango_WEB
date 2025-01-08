import {form, button, createUserLoginModal} from './componentRenderer.js';
import { checkForUserLogged, userLogged } from './checkForUserLogged.js';
import { translations } from '../constants/constants.js';
import { getLocalStorageItem } from './localStorage.js';
import { languages } from '../constants/constants.js';
import { handleModalCreation, handlePageModal, isInDesktop, scrollToTop, showCardMessage, toggleBodyScrollableBehavior, toggleOverlay } from './utils.js';
import { isInSpanish, settedLanguage } from './languageHandler.js';
const {english, spanish} = languages;
const headerTranslations  = translations['header'];
const categoriesTranslations = translations['categories'];
const formTranslations = translations['userForm'];
const userLoggedTranslations = translations['userLogged'];

const SCREEN_WIDTH = window.innerWidth;

window.addEventListener('DOMContentLoaded', () => {
    scrollToTop()
    if(SCREEN_WIDTH < 720){
        checkForNavbarClicks();
        checkForShopDropdownClicks();
    }
    renderFormAndButton();
    paintUserIconOrLetter();
    if(userLogged){
        checkForUserLoggedModalClicks();
        checkForUserLoggedModalClose();
        checkForUserAnchorsClicks();
    } else {
        checkForUserIconClicks();
    }
})

const checkForUserLoggedModalClose = () => {
    const closeBtn = document.querySelector('.close-user-logged-modal');
    const userLoggedModal = document.querySelector('.logged-user-modal');
    closeBtn.addEventListener('click', () => {
        userLoggedModal.classList.toggle('logged-user-modal-active')
        if(SCREEN_WIDTH < 720){
            toggleBodyScrollableBehavior();
            toggleOverlay();
        }
    })
}

const checkForUserLoggedModalClicks = () => {
    const userInitials = document.querySelector('.user-initials');
    const userLoggedModal = document.querySelector('.logged-user-modal');
    userInitials.addEventListener('click', () => {
        userLoggedModal.classList.add('logged-user-modal-active')
        if(SCREEN_WIDTH < 720){
            toggleBodyScrollableBehavior();
            toggleOverlay();
        }
    })
}

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
    userIcon.addEventListener('click', async () => {
        if(!userLogged){
            // toggleLoginModal();
            createUserLoginModal();
            // Abro el modal
            handlePageModal(true);

        }
    })
}


const checkForLoginModalCloseClicks = () => {
    const closeBtn = document.querySelector('.close-sign-in-modal');
    closeBtn.addEventListener('click', () => {
        toggleLoginModal();
    })
}

const toggleLoginModal = () => {
    const modal = document.querySelector('.no-logged-user-modal');
    modal.classList.toggle('no-logged-user-modal-active');
    if(SCREEN_WIDTH < 1024){
        toggleBodyScrollableBehavior();
        toggleOverlay();
    }
}

const renderFormAndButton = () => {
    const localStorageItem = getLocalStorageItem('language');
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
    const formContainerCreated = form(formProps);
    const modal = document.querySelector('.no-logged-user-modal');
    modal.appendChild(formContainerCreated);

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
    const buttonCreated = button(buttonProps);
    formContainerCreated.append(buttonCreated);
}

export const translateNavbar = () => {
    const linksContent = document.querySelectorAll('.page-link-item');
    linksContent.forEach((link) => {
        const isMobileShopItem = link.querySelector('.shop-mobile-span');
        if(isMobileShopItem){
            const mobileShopSpan = isMobileShopItem;
            const linkDataset = mobileShopSpan.dataset.translation;
            const translation = headerTranslations[linkDataset]?.[settedLanguage];
            mobileShopSpan.textContent = translation;
            const shopItems = document.querySelectorAll('.shop-category-item a');
            const menDataset = shopItems[0].dataset.translation;
            const womenDataset = shopItems[1].dataset.translation;
            shopItems[0].textContent = translations.categories[menDataset]?.[settedLanguage];
            shopItems[1].textContent = translations.categories[womenDataset]?.[settedLanguage];
        } else {
            const itemAnchor = link.querySelector('a');
            const linkDataset = itemAnchor.dataset.translation;
            const translation = headerTranslations[linkDataset]?.[settedLanguage];
            itemAnchor.textContent = translation;
        }

    });
}

const paintUserIconOrLetter = () => {
    if(userLogged){
        const firstNameLetter = userLogged.first_name.split('')[0]
        const lastNameLetter = userLogged.last_name.split('')[0]
        const userInitialsContainer = document.querySelector('.user-initials-container');
        const userInitialsElement = userInitialsContainer.querySelector('span');
        console.log(userInitialsElement)
        userInitialsElement.textContent = firstNameLetter + lastNameLetter;
        console.log(userInitialsElement)
        userInitialsContainer.classList.toggle('hidden');
    } else {
        const userIconElement = document.querySelector('.user-icon');
        userIconElement.classList.toggle('hidden');
    }
}

export const translateUserLoggedModal = () => {
    const userAnchors = document.querySelectorAll('.user-anchors');
    userAnchors.forEach(anch => {
        const anchorDataset = anch.dataset.translation;
        const translation = userLoggedTranslations[anchorDataset]?.[settedLanguage];
        anch.textContent = translation;
    })
}