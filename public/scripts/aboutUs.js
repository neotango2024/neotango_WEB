import { isInSpanish } from "./languageHandler.js";
import { translations } from "../constants/constants.js";
const {aboutUs} = translations;

window.addEventListener('load', () => {
    const { pathname } = window.location;
    if (!pathname.endsWith("/nosotros")) return;
    const imagePlaceHolders = document.querySelector('.about-placeholders-container');
    imagePlaceHolders.classList.add('hidden');
    const titlePlaceHolder = document.querySelector('.title-placeholder');
    titlePlaceHolder.classList.add('hidden');
    translateAboutUsContent()
})


export const translateAboutUsContent = () => {
    const language = isInSpanish ? 'esp' : 'eng';
    const h1Element = document.querySelector('.page-title');
    h1Element.textContent = aboutUs.title[language];
    const firstDescription = document.querySelector('.first-description');
    firstDescription.textContent = aboutUs.firstDescription[language];
    const secondDescription = document.querySelector('.second-description');
    secondDescription.textContent = aboutUs.secondDescription[language];
    const thirdDescription = document.querySelector('.third-description');
    thirdDescription.textContent = aboutUs.thirdDescription[language];
}