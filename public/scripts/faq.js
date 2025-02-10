import { isInSpanish } from "./languageHandler.js";
import { translations } from "../constants/constants.js";

window.addEventListener('load', () => {
    const { pathname } = window.location;
    if (!pathname.endsWith("/faq")) return;
    const imagePlaceHolders = document.querySelector('.faq-placeholders-container');
    imagePlaceHolders.classList.add('hidden');
    const titlePlaceholder = document.querySelector('.title-placeholder');
    titlePlaceholder.classList.add('hidden');
    translateFaqContent();
})

export const translateFaqContent = () => {
    const main = document.querySelector('.faq-main');
    const lang = isInSpanish ? 'es' : 'en';
    const h1Element = document.querySelector('.page-title');
    h1Element.textContent = translations.faq.title[lang];
    const faqs = document.querySelectorAll('.faq-container');
    faqs.forEach((faq, i) => {
        const title = faq.querySelector('.faq-title');
        const description = faq.querySelector('.faq-description');

        title.textContent = translations.faq[i].title[lang];
        console.log(translations.faq[i].title[lang])
        description.textContent = translations.faq[i].description[lang];
        const additionalDescription = faq.querySelector('.additional-faq-description');
        if(additionalDescription && lang === 'eng'){
            additionalDescription.classList.add('hidden')
        }
        if(additionalDescription){
            additionalDescription.textContent = translations.faq[i].espDescription['esp'];   
        }
    })
} 