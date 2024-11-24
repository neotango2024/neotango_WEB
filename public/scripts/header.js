import {form, button} from './componentRenderer.js';
import {setItem, getItem} from './localStorage.js';

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
    const selectedLanguage = getItem('language');
    if(!selectedLanguage){
        toggleLanguagesModal();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    }
    changeLanguageFlag(selectedLanguage ?? 'Español');
};

const checkForLanguageSelection = () => {
    const modalImgs = document.querySelectorAll('.language-container');
    modalImgs.forEach(imgContainer => imgContainer.addEventListener('click', () => {
        const imgElement = imgContainer.querySelector('img');
        const idSelector = imgElement.getAttribute('id');
        changeLanguageFlag(idSelector)
        setItem('language', idSelector)
        toggleLanguagesModal();
        toggleOverlay();
        toggleBodyScrollableBehavior();
    }));
    
}

const changeLanguageFlag = (selectedLanguage) => {
    const modalImgs = document.querySelectorAll('.modal-flag-container img');
    modalImgs.forEach(img => {
        const idSelector = img.getAttribute('id');
        if(idSelector === selectedLanguage){
            const imgSrc = img.getAttribute('src');
            const activeImg = document.querySelector('.active-flag');
            activeImg.src = imgSrc
        }
    })
}

const checkForShopDropdownClicks = () => {
    const mobileAnchors = document.querySelectorAll('.mobile-anchor');
    mobileAnchors.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const span = anchor.querySelector('span');
            const isShopAnchor = span.textContent === 'Tienda' || span.textContent === 'Shop';
            if(isShopAnchor){
                e.preventDefault();
                toggleShopDropdown();
            }
        })
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

const checkUserLogged = () => {
    // TODO - CHECK FOR USER LOGIN
    return false;
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
    }
    button(buttonProps);
}