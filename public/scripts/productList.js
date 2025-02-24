import { productCard } from "./componentRenderer.js";
import { isInSpanish, translateProductCards } from "./languageHandler.js";
import { setProductsFromDB, productsFromDB, getLastParamFromURL, isOnPage, scriptInitiator} from "./utils.js";
const {pathname} = window.location;

let products;
window.addEventListener('DOMContentLoaded', async () => {
    if (!isOnPage("/categoria/1") && !isOnPage("categoria/2")) return;
    await scriptInitiator()
    const categoryToLook = getLastParamFromURL()
    await setProductsFromDB({categoryId: categoryToLook});
    products = productsFromDB;
    handleRenderProductList(products);
    //translateCategoryTitle();
    translateFilters();
    listenForFilterClicks();
})

const handleRenderProductList = (products) => {
    const placeholdersContainer = document.querySelector('.placeholders-container');
    if(!placeholdersContainer.classList.contains('hidden')) placeholdersContainer.classList.add('hidden');
    const productsContainer = document.querySelector('.products-container');
    productsContainer.innerHTML = '';
    products.forEach((prod) => {
        let productCardElement = productCard(prod);
        productsContainer.appendChild(productCardElement)
    })
}

export const translateCategoryTitle = () => {
    const pageTitle = document.querySelector('.page-title');
    const categoryNumber = Number(pathname.split('/')[2]);
    switch(categoryNumber){
        case 1:
            pageTitle.textContent = `${isInSpanish ? "Zapatos de dama" : "Women's shoes"}`
            break;
        case 2: 
            pageTitle.textContent = `${isInSpanish ? "Zapatos de caballero" : "Men's shoes"}`
            break;
    }
}

export const translateFilters = () => {
    const filterContainer = document.querySelector('.filter-dropdown');
    const filterOptions = filterContainer.querySelectorAll('option');
    filterOptions.forEach(filter => {
        const translation =  isInSpanish ? filter.dataset.esp_translation : filter.dataset.eng_translation;
        filter.textContent = translation
    })
    filterContainer.classList.remove('hidden');
}

const listenForFilterClicks = () => {
    const filterContainer = document.querySelector('.dropdown');
    filterContainer.addEventListener('change', (e) => {
        filterProducts(e.target.value);
    })
}

const filterProducts = (value) => {
    switch (value) {
        case 'newest':
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'lowToHigh':
            products.sort((a, b) => isInSpanish ? a.ars_price - b.ars_price : a.usd_price - b.usd_price)
            break;
        case 'highToLow':
            products.sort((a, b) => isInSpanish ? b.ars_price - a.ars_price : b.usd_price - a.usd_price);           
            break;
        }
    handleRenderProductList(products);
}

export const handleTranslateCategoryProducts = () => {
    const container = document.querySelector('.products-container');
    translateProductCards(container);
}