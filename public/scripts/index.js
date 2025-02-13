import { productCard } from "./componentRenderer.js";
//import { LANGUAGES } from "../../src/utils/staticDB/constants.js";
const SCREEN_WIDTH = window.innerWidth;
import { translations } from "../constants/constants.js";
import { isInSpanish, settedLanguage, translateProductCards } from "./languageHandler.js";
import { productsFromDB, setProductsFromDB } from "./utils.js";
import { scriptInitiator } from "./utils.js";
import { isOnPage } from "./utils.js";
const companyInfoTranslations = translations.companyInfo;


window.addEventListener("load", async () => {
  if (!isOnPage("")) return;
  await scriptInitiator(); //Inicio userLogged y lo del lenguaje
  const slides = document.querySelectorAll(".slider-img-container");
  const dotsContainer = document.querySelector(".dots-container");
  let currentImage = 0;
  let slidesLength = slides.length;

  const carouselInterval = setInterval(handleCarouselActualImage, 3000);
  const dotsInterval = setInterval(dotsNextSlide, 3001);

  handleCarouselImgClasses();

  function handleCarouselImgClasses() {
    slides.forEach((img, i) => {
      // function that adds or removes the class of an image
      if (i == currentImage) {
        img.classList.add("active");
        img.classList.remove("prev-slide");
        img.classList.remove("next-slide");
      } else if (
        i == currentImage - 1 ||
        (currentImage == 0 && i == slidesLength - 1)
      ) {
        img.classList.remove("active");
        img.classList.remove("next-slide");
        img.classList.add("prev-slide");
      } else {
        img.classList.remove("active");
        img.classList.remove("prev-slide");
        img.classList.add("next-slide");
      }
    });
  }

  function handleCarouselActualImage() {
    if (currentImage < slidesLength - 1) {
      // function that handles the maths of the actual image.
      // this function just redeclares the image based on the condition
      // whether is the last dot or not
      currentImage += 1;
    } else {
      currentImage = 0;
    }
    return handleCarouselImgClasses();
  }

  for (let i = 0; i < slidesLength; i++) {
    if (i == 0) {
      dotsContainer.innerHTML +=
        "<div class='home-slider-dot dot-active'></div>";
    } else {
      dotsContainer.innerHTML += "<div class='home-slider-dot'></div>";
    }
  }

  const dots = document.querySelectorAll(".home-slider-dot");
  // i needed to declare the dots here because of the for because if not it came undefined

  dotsJump();

  function dotsNextSlide() {
    if (!dots.length) return;
    const activeDot = document.querySelector(".dot-active");
    activeDot?.classList.remove("dot-active");
    if (activeDot?.nextElementSibling) {
      const dotToActive = activeDot.nextElementSibling;
      dotToActive.classList.add("dot-active");
    } else {
      dots[0].classList.add("dot-active");
    }
  }

  function dotsJump() {
    dots?.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        if (!dot.classList.contains("dot-active")) {
          const activeDot = document.querySelector(".dot-active");
          activeDot.classList.remove("dot-active");
          dot.classList.add("dot-active");
          currentImage = i;
          handleCarouselImgClasses();
          clearInterval(carouselInterval);
          clearInterval(dotsInterval);
        }

        // const addresWrapper = document.querySelector('.main');
        // addresWrapper.innerHTML = '';
        // homeLabels.forEach(label => {
        //     let card = homeLabel({
        //         name: label.name,
        //         desc: label.desc,
        //     });
        //     addresWrapper.appendChild(card);
        // });
        // activateAccordions();

        renderProducts();
        // initiateMenuBtn();
      });
    });
  }

  await handleRenderFeatureProducts();
  translateCompanyInfo()

});

export const translateCompanyInfo = () => {
  const infoItemContainers = document.querySelectorAll('.info-item-container');
  const settedLanguage = isInSpanish ? 'es' : 'en';
  infoItemContainers?.forEach(item => {
    const itemDataset = item.dataset.translation;
    const itemTitle = item.querySelector(".info-title");
    const itemDesc = item.querySelector(".info-description");
    itemTitle.textContent =
      companyInfoTranslations?.[itemDataset]?.[settedLanguage];
    itemDesc.textContent =
      companyInfoTranslations?.[itemDataset]?.description?.[settedLanguage];
  });
};

const handleRenderFeatureProducts = async () => {
  if (productsFromDB.length === 0) {
    await setProductsFromDB({ categoryId: 1, limit: 5 });
  }
  const skeletons = document.querySelectorAll(".skeleton-product");
  const container = document.querySelector(".products-carousel");
  const cardWidth = 200;
  const totalProducts = productsFromDB.length * 2;
  container.innerHTML = "";
  productsFromDB.forEach((prod, index) => {
    if (skeletons[index]) {
      skeletons[index].style.display = "none";
    }
    let productCardElement = productCard(prod, null, true);
    container.appendChild(productCardElement);
  });
  const items = [...container.children];
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    container.appendChild(clone);
  });
  const totalWidth = totalProducts * cardWidth;
  const scrollDistance = -totalWidth + cardWidth;

  container.style.setProperty("--scroll-distance", `${scrollDistance}px`);

  container.style.animationDuration = "20s";
};

export const handleTranslateFeatureProducts = () => {
  const h3Element = document.querySelector('.page-title');
  h3Element.textContent = isInSpanish ? 'Productos destacados' : 'Featured products';

  const container = document.querySelector('.products-carousel');
  translateProductCards(container);
  
}
