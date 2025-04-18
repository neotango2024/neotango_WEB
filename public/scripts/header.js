import {form, button, createUserLoginModal, generateHeaderShopDropdown, generateUserLoggedDropdown} from './componentRenderer.js';
import { checkForUserLogged, userLogged } from './checkForUserLogged.js';
import { translations } from '../constants/constants.js';
import { getLocalStorageItem } from './localStorage.js';
import { languages } from '../constants/constants.js';
import { handleModalCreation, handlePageModal, isInDesktop, isInMobile, scriptInitiator, scrollToTop, showCardMessage, toggleBodyScrollableBehavior, toggleOverlay } from './utils.js';
import { isInSpanish, settedLanguage } from './languageHandler.js';
const headerTranslations  = translations['header'];
const categoriesTranslations = translations['categories'];
const formTranslations = translations['userForm'];
const regularUserLoggedTranslations = translations['userLoggedMenu'];
const adminLoggedMenuTranslations = translations['adminLoggedMenu'];

const SCREEN_WIDTH = window.innerWidth;
const headerExportObject = {
    headerScriptInitiator: null,
}
window.addEventListener('DOMContentLoaded', async () => {
    scrollToTop();
    headerExportObject.headerScriptInitiator = function(){
        if(SCREEN_WIDTH < 720){
            checkForNavbarClicks();
            checkForMobileShopDropdownClicks();
        } else if (SCREEN_WIDTH < 1024) {
            checkForDesktopShopDropdownClicks()
        }
        if(SCREEN_WIDTH >= 720 && SCREEN_WIDTH < 1024){
            checkForWindowClicksForDropdowns();
        }
        paintUserIconOrLetter();
        if(userLogged){
            checkForUserLoggedModalClicks();
        } else {
            checkForUserIconClicks();
        }
        checkCartItemsToPaintQuantity();
        checkForLogout()
    }
    
})

const checkForLogout = () => {
    const params = new URLSearchParams(window.location.search);
    const isComingFromLoginOut = params.get('logout') == 1;
    if(isComingFromLoginOut){
        checkCartItemsToPaintQuantity(isComingFromLoginOut)
    }
}

export const checkCartItemsToPaintQuantity = (loggedOut = false) => {
    let tempCartItems;
    if(userLogged && !loggedOut){
        tempCartItems = userLogged.tempCartItems;
    } else {
        const noUserLoggedCartItems = getLocalStorageItem('cartItems');
        if(!noUserLoggedCartItems){
            tempCartItems = [];
        } else {
            tempCartItems = noUserLoggedCartItems;
        }
    }
    const cartNumberContainer = document.querySelector('.cart-number');
    cartNumberContainer.textContent = tempCartItems.length;
}

const checkForDesktopShopDropdownClicks = () => {
    const desktopShopItem = document.querySelector('.desktop-shop-item-text-container');
    const desktopShopDropdown = document.querySelector('.desktop-shop-dropdown');
    desktopShopItem.addEventListener('click', (e) => {
        e.preventDefault();
        if(userLogged){
            const userInitialsDropdown = document.querySelector('.logged-user-modal');
            if(userInitialsDropdown.classList.contains('logged-user-modal-active')){
                userInitialsDropdown.classList.remove('logged-user-modal-active')
            }
        }
        desktopShopDropdown.classList.add('desktop-shop-dropdown-active');
    })
}

const checkForWindowClicksForDropdowns = () => {
    document.addEventListener('click', function(e) {
        const clickedElement = e.target;
        if(!clickedElement.classList.contains('logged-user-modal') && !clickedElement.classList.contains('user-initials') && !clickedElement.classList.contains('.shop-a')){
            if(userLogged){
                const userLoggedModal = document.querySelector('.logged-user-modal');
                if(userLoggedModal.classList.contains('logged-user-modal-active')){
                    userLoggedModal.classList.remove('logged-user-modal-active')
                }
            }
            const shopDropdown = document.querySelector('.desktop-shop-dropdown');
            if(shopDropdown.classList.contains('desktop-shop-dropdown-active')){
                shopDropdown.classList.remove('desktop-shop-dropdown-active')
            }
        }
    });
}

const checkForUserLoggedModalClicks = () => {
    const userInitials = document.querySelector('.user-initials');
    const userLoggedModal = document.querySelector('.logged-user-modal');
    const shopDropdown = document.querySelector('.desktop-shop-dropdown');
    if(SCREEN_WIDTH < 1024) {
        userInitials.addEventListener('click', () => {
            if(shopDropdown.classList.contains('desktop-shop-dropdown-active')){
                shopDropdown.classList.remove('desktop-shop-dropdown-active');
            }
            userLoggedModal.classList.add('logged-user-modal-active');
            if(SCREEN_WIDTH < 720){
                toggleBodyScrollableBehavior();
                toggleOverlay();
            }
        })
    }
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

const checkForMobileShopDropdownClicks = () => {
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
            handlePageModal(true);
        }
    })
}

export const translateNavbar = () => {
    const linksContent = document.querySelectorAll('.page-link-item');
    linksContent.forEach((link) => {
        const isMobileShopItem = link.querySelector('.shop-mobile-span');
        const settedLanguage = isInSpanish ? "es" : "en";
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
    if(!isInMobile()){
        const headerShopDropdownToReplace = document.querySelector('.ui.menu.header-dropdown')
        const headerShopDropdown = generateHeaderShopDropdown();
        headerShopDropdownToReplace.parentNode.replaceChild(headerShopDropdown, headerShopDropdownToReplace);
        activateHeaderDropdowns();
    }
   
}

export const paintUserIconOrLetter = () => {
    const userIconElement = document.querySelector('.user-icon');
    if(userLogged){
        userIconElement.classList.add('hidden');
        const userLoggedDropdownToChange = document.querySelector('.user-initials-container');
        const userInitialsDropdown = generateUserLoggedDropdown();
        userLoggedDropdownToChange.parentNode.replaceChild(userInitialsDropdown, userLoggedDropdownToChange);
        activateHeaderDropdowns();
    } else {
        userIconElement.classList.remove('hidden');
    }
}

const decideAndListenForMobileUserInitialsClick = () => {
    const userInitialsContainer = document.querySelector('.user-initials-container');
    const closeMenu = document.querySelector('.close-logged-menu-container');
    if(!closeMenu.dataset.listened){
        closeMenu.dataset.listened = true;
        closeMenu.addEventListener('click', () => {
            const mobileUserLogged = document.querySelector('.mobile-logged-user-navbar');
            mobileUserLogged.classList.toggle('mobile-logged-user-navbar-active');
                
        })
    }
    userInitialsContainer.addEventListener('click', () => {
        toggleLoggedUserMenu();
        const adminMenu = document.querySelector('.regular-user-logged-menu');
        const userMenu = document.querySelector('.regular-user-logged-menu');
        const {user_role_id} = userLogged;
        if(user_role_id == 1){
            userMenu.style.display = "none";
        } else {
            adminMenu.style.display = "none"
        }
        translateUserLoggedMenuItems(user_role_id);
    })
}

export const translateUserLoggedMenuItems = (userRoleId) => {
   
    let checkedMenuItems;
    let checkedTranslations;
    const lang = isInSpanish ? 'es' : 'en';
    if(userRoleId == 1){
        checkedMenuItems = document.querySelector('.admin-logged-menu').children;
        checkedTranslations = adminLoggedMenuTranslations;
    } else {
        checkedMenuItems = document.querySelector('.regular-user-logged-menu').children;
        checkedTranslations = regularUserLoggedTranslations;
    }
    checkedMenuItems = Array.from(checkedMenuItems)
    checkedMenuItems.forEach(item => {
        const anchor = item.querySelector('a');
        const dataset = anchor.dataset.translation;
        anchor.textContent = checkedTranslations[dataset]?.[lang];
    })
}

const toggleLoggedUserMenu = () => {
    // logic here
    const mobileUserLogged = document.querySelector('.mobile-logged-user-navbar');
    mobileUserLogged.classList.toggle('mobile-logged-user-navbar-active')

}

function activateHeaderDropdowns(){
    $('.header .menu.nav-link-item .browse')
    .popup({
        inline     : true,
        hoverable  : true,
        position   : 'bottom left',
        delay: {
        show: 150,
        hide: 600
        }
    });
    if(SCREEN_WIDTH > 768){
        $('.header .menu.user-initials-container .browse')
        .popup({
            inline     : true,
            hoverable  : true,
            position   : 'bottom right',
            delay: {
            show: 150,
            hide: 600
            }
        })
    } else {
        decideAndListenForMobileUserInitialsClick();
    };

}
export {headerExportObject};