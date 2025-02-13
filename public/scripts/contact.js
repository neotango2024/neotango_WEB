import { isInSpanish } from "./languageHandler.js";
import { translations } from "../constants/constants.js";
import { createLoadingSpinner } from "./componentRenderer.js";
import { isOnPage, scriptInitiator } from "./utils.js";

window.addEventListener("load", async () => {
  try {
    if (!isOnPage("/contacto")) return;
    await scriptInitiator();
    const imagePlaceHolders = document.querySelector(
      ".contact-placeholders-container"
    );
    imagePlaceHolders.classList.add("hidden");
    const titlePlaceholder = document.querySelector(".title-placeholder");
    titlePlaceholder.classList.add("hidden");
    const pageTitle = document.querySelector(".page-title");
    pageTitle.classList.remove("hidden");
    const formContainer = document.querySelector(".contact-form-container");
    formContainer.classList.remove("hidden");
    translateContactContent();
    listenForFormSubmit();
  } catch (error) {
    return console.log(error);
  }
});

export const translateContactContent = () => {
<<<<<<< HEAD
    const h1Element = document.querySelector('.page-title');
    const lang = isInSpanish ? 'es' : 'en';
    h1Element.textContent = translations.contact.title[lang];
    const inputs = document.querySelectorAll('.input');
    inputs.forEach((inp, i) => {
        inp.placeholder = translations.contact[i][lang]
    })
    const button = document.querySelector('.contact-form-submit-btn');
    button.textContent = isInSpanish ? 'Enviar' : 'Submit';
}
=======
  const h1Element = document.querySelector(".page-title");
  const lang = isInSpanish ? "esp" : "eng";
  h1Element.textContent = translations.contact.title[lang];
  const inputs = document.querySelectorAll(".input");
  inputs.forEach((inp, i) => {
    inp.placeholder = translations.contact[i][lang];
  });
  const button = document.querySelector(".contact-form-submit-btn");
  button.textContent = isInSpanish ? "Enviar" : "Submit";
};
>>>>>>> dfa9be85c9d79b236af5b5e3be27ba82ac617734

const listenForFormSubmit = () => {
  const form = document.querySelector(".contact-form-container");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFormSubmit(form);
  });
};

const handleFormSubmit = async (form) => {
  const inputs = form.querySelectorAll(".input");
  let isValidToSubmit = true;
  inputs.forEach((inp) => {
    inp.classList.remove("input-error");
    if (!inp.value) {
      isValidToSubmit = false;
      inp.classList.add("input-error");
    }
  });
  const emailInput = document.querySelector(".email-input");
  const emailInputValue = emailInput.value;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmail = emailRegex.test(emailInputValue);
  if (!isEmail) {
    emailInput.classList.add("input-error");
    isValidToSubmit = false;
  }
  if (isValidToSubmit) {
    await sendEmail();
  }
};

const sendEmail = async () => {
  const form = document.querySelector(".contact-form");
  const button = document.querySelector(".contact-form-submit-btn");
  const loadingSpinner = createLoadingSpinner();
  button.classList.add("hidden");
  form.appendChild(loadingSpinner);
  const nameInputValue = document.querySelector(".name-input").value;
  const emailInputValue = document.querySelector(".email-input").value;
  const messageInputValue = document.querySelector(".contact-textarea").value;
  try {
    const sendEmailResponse = await fetch("/api/user/send-contact-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInputValue,
        email: emailInputValue,
        message: messageInputValue,
      }),
    });
    loadingSpinner.classList.add("hidden");
    button.classList.remove("hidden");
    button.classList.add("disabled");
    button.textContent = isInSpanish ? "Mensaje enviado" : "Sent";
  } catch (error) {
    console.log("error");
  }
};
