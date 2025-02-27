import { isInSpanish } from "./languageHandler.js";
import { translations } from "../constants/constants.js";
import { isOnPage, scriptInitiator } from "./utils.js";

window.addEventListener("load", async () => {
  try {
    if (!isOnPage("/faq")) return;
    await scriptInitiator();
    const imagePlaceHolders = document.querySelector(
      ".faq-placeholders-container"
    );
    imagePlaceHolders.classList.add("hidden");
    const titlePlaceholder = document.querySelector(".title-placeholder");
    titlePlaceholder.classList.add("hidden");
    translateFaqContent();
  } catch (error) {
    return console.log(error);
    
  }
});

export const translateFaqContent = () => {
  const main = document.querySelector(".faq-main");
  const lang = isInSpanish ? "es" : "en";
  const h1Element = document.querySelector(".page-title");
  h1Element.textContent = translations.faq.title[lang];
  const faqs = document.querySelectorAll(".faq-container");
  faqs.forEach((faq, i) => {
    const title = faq.querySelector(".faq-title");
    const description = faq.querySelector(".faq-description");

    title.textContent = translations.faq[i].title[lang];
    console.log(translations.faq[i].title[lang]);
    description.textContent = translations.faq[i].description[lang];
    const additionalDescription = faq.querySelector(
      ".additional-faq-description"
    );
    if (additionalDescription && lang === "eng") {
      additionalDescription.classList.add("hidden");
    }
    if (additionalDescription) {
      additionalDescription.textContent =
        translations.faq[i].espDescription["esp"];
    }
  });
};
