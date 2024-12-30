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
import { deleteLocalStorageItem, getLocalStorageItem, setLocalStorageItem } from "./localStorage.js";
import { activateContainerLoader } from "./utils.js";

let productId;

window.addEventListener("load", async () => {
  try {
    let relatedProducts = [];
    let productID = '';
    //Hago el pedido al fetch de 4 productos y filtrar 3
    const main = document.querySelector('.main');
    productId = main.dataset.product_id;
    activateContainerLoader(main, false)
    checkForAddToCartBtnClicks();
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
});

const checkForAddToCartBtnClicks = () => {
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  addToCartBtn.addEventListener('click', async () => {
    addToCartBtn.classList.add('loading');
    await handleAddProductToCart(addToCartBtn);
    addToCartBtn.classList.remove('loading');
  })
}

const handleAddProductToCart = async () => {
  const size = document.getElementById('size-id').value;
  const taco = document.getElementById('taco-id').value;
  const cartObject = {
    productId,
    sizeId: size,
    tacoId: taco,
    quantity: 1
  }
  if(userLogged !== null) {
    fetch(`/api/cart/${userLogged.id}`, {
      method: 'POST',
      body: JSON.stringify(cartObject)
    })
  } else {
    setLocalStorageItem('cartItems', cartObject, true);
  }
}
