import { userLogged } from "./checkForUserLogged.js";
import { checkoutCard, createAddressModal, createPhoneModal, form } from "./componentRenderer.js";
import {
  countriesFromDB,
  paymentTypesFromDB,
  setCountries,
  setPaymentTypes,
  setShippingTypes,
  shippingTypesFromDB,
} from "./getStaticTypesFromDB.js";
import { isInSpanish, settedLanguage } from "./languageHandler.js";

window.addEventListener("load", async () => {
  try {
    let relatedProducts = [];
    let productID = '';
    //Hago el pedido al fetch de 4 productos y filtrar 3
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
});


export {exportObj}