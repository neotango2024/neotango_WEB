import { generatePostOrderCard } from "./componentRenderer.js";
import { activateCopyMsg, copyElementValue } from "./utils.js";
const postOrderExportObject = {
    pageConstructor: null,
}
window.addEventListener("load", async () => {
  try {
    // Obtén el parámetro `order` de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderTraIdFromURL = urlParams.get("orderId");
    const orderShippingTypeIdFromURL = urlParams.get("shippingTypeId");

    postOrderExportObject.pageConstructor = function(){
        const main =  document.querySelector('.main');
        main.innerHTML = '';
        const orderCard = generatePostOrderCard(orderTraIdFromURL,orderShippingTypeIdFromURL);
        main.appendChild(orderCard);
        listenToCopyOrderNumberBtn();
    }
    function listenToCopyOrderNumberBtn() {
      const copyBtn = document.querySelector(".copy-order-number-btn");
      if (copyBtn.dataset.listened) return;
      copyBtn.dataset.listened = true;
      copyBtn.addEventListener("click", () => {
        const orderNumberP = document.querySelector(".card-order-number");
        copyElementValue(orderNumberP.textContent);
        activateCopyMsg();
      });
    }
    postOrderExportObject.pageConstructor();
  } catch (error) {
    return console.log(error);
  }
});

export {postOrderExportObject}
