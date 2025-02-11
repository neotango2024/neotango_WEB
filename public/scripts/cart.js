import { userLogged } from "./checkForUserLogged.js";
import {
  checkoutCard,
  createAddressModal,
  createPhoneModal,
  form,
} from "./componentRenderer.js";
import {
  countriesFromDB,
  paymentTypesFromDB,
  setCountries,
  setPaymentTypes,
  setShippingTypes,
  setSizes,
  setTacos,
  shippingTypesFromDB,
  sizesFromDB,
  tacosFromDB,
} from "./getStaticTypesFromDB.js";
import { isInSpanish, settedLanguage } from "./languageHandler.js";
import {
  deleteLocalStorageItem,
  getLocalStorageItem,
  setLocalStorageItem,
} from "./localStorage.js";
import {
  activateContainerLoader,
  displayBigNumbers,
  handleNewAddressButtonClick,
  handleNewPhoneButtonClick,
  handlePageModal,
  handlePhoneFetch,
  isInDesktop,
  productsFromDB,
  removeIndexesFromArray,
  setShippingZones,
  setVariationsFromDB,
  shippingZonesFromDB,
  variationsFromDB,
} from "./utils.js";
let cartExportObj = {
  pageConstructor: null,
  paintCheckoutPhoneSelect: null,
  paintCheckoutAddressesSelect: null,
};
window.addEventListener("DOMContentLoaded", async () => {
  try {
    if (!window.location.pathname.endsWith("/carro")) return;
    const main = document.querySelector(".main");
    const cartProductsWrapper = document.querySelector(
      ".cart-products-cards-wrapper"
    );
    //Escribo el title
    document.title = isInSpanish ? `Carro` : `Cart`;
    //seteo los productos
    let cartProducts = [];
    let shippingCost = 0; //Esto va cambiando por eso lo seteo aca
    let sectionIndex = 0; //Para ver donde esta parado
    cartExportObj.pageConstructor = async function () {
      try {
        await setCartProducts();
        //Agaro el titulo "carro de compras" y dependiendo que idioma lo pinto
        const pageTitle = document.querySelector(".main .cart-products-title");
        pageTitle.innerHTML = isInSpanish
          ? "Carro de compras"
          : "Shopping cart";

        if (sectionIndex == 1) {
          if (!countriesFromDB.length) await setCountries();
          if (!shippingZonesFromDB.length) await setShippingZones();
          //aca se que estoy en el formulario de pago
          await generateCheckoutForm();
          setDetailContainer();
          return;
        }
        //Aca solo pinto las cards
        paintCheckoutCards();
        setDetailContainer();
        //Ahora escucho los botones
        checkCheckoutCardButtons();
        return;
      } catch (error) {
        return console.log(error);
      }
    };

    // =========================================
    // funciones
    //Pinta la seccion de detalle
    function setDetailContainer() {
      const containersToAppend = document.querySelectorAll(
        ".cart-detail-rail-container"
      );
      containersToAppend.forEach(async (cont) => {
        cont.innerHTML = "";
        //Lo genero
        let newDetailContainer = createCartDetailContainer();
        // Reemplazar el contenedor antiguo con el nuevo
        cont.appendChild(newDetailContainer);
      });
      checkForSectionButtons(); //Para los botones de "finalizar compra" o directo el de mp
    }
    //Pinta las tarjetas
    function paintCheckoutCards() {
      cartProductsWrapper.innerHTML = "";
      const formWrapper = document.querySelector(".form-wrapper");
      formWrapper.innerHTML = ""; //Esto es porque si pinto las checkout cards entonces se que estoy en la primer seccion
      if (cartProducts?.length) {
        cartProducts.forEach((cartItem) => {
          //Esto es para que renderize bien
          cartItem.product.variation_id = cartItem.variation_id;
          cartItem.product.sizeFromDB = cartItem.size;
          cartItem.product.tacoFromDB = cartItem.taco;
          cartItem.product.quantity = cartItem.quantity;
          cartItem.product.maxQuantityAvailable = cartItem.maxQuantityAvailable;
          const checkoutCardElement = checkoutCard(cartItem.product);
          cartProductsWrapper.appendChild(checkoutCardElement);
        });
        return;
      }
      //ACa no tiene proudctos, pinto algo
      cartProductsWrapper.innerHTML = `<p>${
        isInSpanish
          ? "No tienes productos en el carro!"
          : "There are no products on your cart!"
      }</p>`;
      //Pinto disabled el boton de finalizar compra
      const sectionHandlerBtns = document.querySelectorAll(
        ".section-handler-button"
      );
      sectionHandlerBtns.forEach((btn) => btn.classList.add("disabled"));
    }

    function checkForSectionButtons() {
      const sectionButtons = document.querySelectorAll(
        ".section-handler-button"
      );
      sectionButtons.forEach((btn) => {
        if (btn.dataset.listened) return;
        btn.dataset.listened = true;
        btn.addEventListener("click", async () => {
          window.scrollTo(0, 0);
          try {
            if (btn.classList.contains("finalize-order-button")) {
              if (sectionIndex == 0) {
                sectionIndex++;
                btn.classList.add("loading");
                let checkoutCards = Array.from(
                  document.querySelectorAll(".checkout-card")
                );
                checkoutCards = checkoutCards.map((card) => {
                  return {
                    id: card.dataset?.variation_id,
                    quantity: card.querySelector(".card_product_amount")
                      .innerText,
                  };
                });
                if (userLogged) {
                  //Aca tengo que actualizar el carro
                  let response = await fetch(`/api/cart/${userLogged.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tempCartItems: checkoutCards }),
                  });
                  if (!response.ok) {
                    //Aca ver que hacer si da error TODO:
                  }
                  response = await response.json();
                  userLogged.tempCartItems = response.updatedCardItems;
                } else {
                  updateGuestCart();
                }
                await setCartProducts();
                btn.classList.remove("loading");
                main.classList.add("active");
                cartExportObj.pageConstructor();
              } else if (sectionIndex == 1) {
                //Aca ya esta tocando para pagar ==> armo la orden y genero el fetch
                let form = document.querySelector(".checkout-form");
                let body = generateCheckoutFormBodyToFetch(form);
                // Aca ya tengo todo ==> Hago el fetch
                return console.log(body);
              }
              return;
            }
            //ACa limipio el checkout section
            const checkoutSectionForm = document.querySelector(
              ".checkout-section .form-wrapper"
            );
            checkoutSectionForm.innerHTML = "";
            shippingCost = 0; //Reinicio el shippingCost
            sectionIndex = 0; //Reinicio el index
            cartExportObj.pageConstructor();
            return main.classList.remove("active");
          } catch (error) {
            console.log("Falle");
            return console.log(error);
          }
        });
      });
    }
    function checkCheckoutCardButtons() {
      const checkoutCards = document.querySelectorAll(".checkout-card");
      checkoutCards.forEach((card) => {
        if (card.dataset.listened) return;
        card.dataset.listened = true;
        const addBtn = card.querySelector(".add_more_product");
        const minusBtn = card.querySelector(".remove_more_product");
        const removeBtn = card.querySelector(".remove_card_btn");
        const cardPrice = card.querySelector(".card-price");
        let cardVariationID = card.dataset.variation_id;
        let cartProductFromDB = cartProducts.find(
          (cartItem) => cartItem.variation_id == cardVariationID
        );
        
        
        const productPrice = isInSpanish
          ? parseFloat(cartProductFromDB.product?.ars_price)
          : parseFloat(cartProductFromDB.product?.usd_price);
        addBtn.addEventListener("click", () => {
          cartProductFromDB.quantity ++
          if(cartProductFromDB.quantity == cartProductFromDB.maxQuantityAvailable){
            addBtn.classList.add('disabled')
          }
          let actualQuantitySpan = card.querySelector(".card_product_amount");
          actualQuantitySpan.innerHTML =
            parseInt(actualQuantitySpan.innerHTML) + 1;
          if (actualQuantitySpan.innerHTML > 1) {
            //Si es mas de 1 cambio clases
            minusBtn.classList.remove("hidden");
            removeBtn.classList.add("hidden");
          }
          cardPrice.innerHTML = `$${displayBigNumbers(
            parseInt(actualQuantitySpan.innerHTML) * productPrice
          )}`;
          modifyDetailList();
        });
        minusBtn.addEventListener("click", () => {
          cartProductFromDB.quantity --
          //Activo el + denuevo
          addBtn.classList.remove('disabled')
          let actualQuantitySpan = card.querySelector(".card_product_amount");
          actualQuantitySpan.innerHTML =
            parseInt(actualQuantitySpan.innerHTML) - 1;
          if (actualQuantitySpan.innerHTML == 1) {
            //Si es 1 cambio clases
            minusBtn.classList.add("hidden");
            removeBtn.classList.remove("hidden");
          }
          cardPrice.innerHTML = `$${displayBigNumbers(
            parseInt(actualQuantitySpan.innerHTML) * productPrice
          )}`;
          modifyDetailList();
        });
        removeBtn.addEventListener("click", async () => {
          const cardLoader = card.querySelector(".ui.dimmer");
          cardLoader.classList.add("active");
          // Lo saco de la lista si es userLogged
          if (userLogged) {
            let itemID =
              cartProducts.find(
                (prod) => prod.variation_id == card.dataset.variation_id
              ).id || null;
            if (!itemID) return;
            let response = await fetch(`/api/cart/${itemID}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
              // TODO:
            }
            card.remove();
            modifyDetailList();
            return;
            //Aca ya lo borro, lo saco de los del userlogged
            // let indexToRemove = userLogged.tempCartItems
          } else {
            card.remove();
            updateGuestCart();
            modifyDetailList();
            return;
          }
        });
      });
    }
    //escucha los + y - de los productos y en base a eso modifica el detalle
    function modifyDetailList() {
      let productLengthElement = document.querySelector(
        ".detail-row-product-length"
      );
      let totalCostElement = document.querySelector(".detail-row-total-cost");
      let productCostElement = document.querySelector(
        ".detail-row-product-cost"
      );
      let productCards = Array.from(
        document.querySelectorAll(".checkout-card")
      );
      let productLength = productCards?.length;
      let totalCost = parseFloat(shippingCost) || 0; //al principio es solo el shipping
      let productCost = 0;
      productCards.forEach((card) => {
        let cardVariationID = card.dataset.variation_id;
        let cartProductFromDB = cartProducts.find(
          (cartItem) => cartItem.variation_id == cardVariationID
        );
        const unityPrice = isInSpanish
          ? parseFloat(cartProductFromDB?.product?.ars_price)
          : parseFloat(cartProductFromDB?.product?.usd_price);
        const totalUnits = parseInt(
          card.querySelector(".card_product_amount").innerText
        );
        productCost += unityPrice * totalUnits;
        totalCost += unityPrice * totalUnits;
      });
      productLengthElement.innerHTML = `${productLength} producto${
        productLength == 1 ? "" : "s"
      }`;
      productCostElement.innerHTML = `$${displayBigNumbers(productCost)}`;
      totalCostElement.innerHTML = `$${displayBigNumbers(totalCost)}`;
    }
    //Genera el formulario de pago
    async function generateCheckoutForm() {
      try {
        const formWrapper = document.querySelector(".form-wrapper");
        formWrapper.innerHTML = "";
        let shortInputWidth = isInDesktop() ? 40 : 100;
        // Primero pido los types que necesito si es que no estan
        if (!paymentTypesFromDB.length) {
          await setPaymentTypes();
        }
        if (!shippingTypesFromDB.length) {
          await setShippingTypes();
        }
        let shippingTypesForSelect = shippingTypesFromDB?.map((type) => ({
          value: type.id,
          label: isInSpanish ? type.type.es : type.type.en,
        }));
        let userAddressesForDB = userLogged?.addresses?.map((address) => ({
          value: address.id,
          label: `${address.street} (${address.label})`,
        }));
        const props = {
          formTitleObject: {
            title: isInSpanish ? "Formulario de Pago" : "Checkout Form",
          },
          formAction: "/api/order", // Cambiar a la ruta deseada
          method: "POST",
          inputProps: [
            {
              label: isInSpanish ? "Nombre" : "First Name",
              name: "first_name",
              placeholder: isInSpanish
                ? "Ingresa tu nombre"
                : "Enter your first name",
              required: true,
              width: shortInputWidth,
              value: userLogged?.first_name || null,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: isInSpanish ? "Apellido" : "Last Name",
              name: "last_name",
              placeholder: isInSpanish
                ? "Ingresa tu apellido"
                : "Enter your last name",
              required: true,
              width: shortInputWidth,
              value: userLogged?.last_name || null,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: isInSpanish ? "Correo Electrónico" : "Email",
              name: "email",
              type: "email",
              placeholder: isInSpanish
                ? "Ingresa tu correo electrónico"
                : "Enter your email",
              required: true,
              width: 100,
              value: userLogged?.email || null,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: isInSpanish ? "DNI" : "DNI",
              name: "dni",
              placeholder: isInSpanish ? "Ingresa tu DNI" : "Enter your DNI",
              required: true,
              width: 100,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: isInSpanish ? "Teléfono" : "Phone",
              name: "phone_id",
              type: "select",
              options: [],
              required: true,
              width: 100,
              contClassNames: "phone-container",
              inpClassNames: "",
            },
            {
              label: isInSpanish ? "Tipo de Envío" : "Shipping Type",
              name: "shipping_type_id",
              type: "select",
              options: shippingTypesForSelect,
              required: true,
              width: 100,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: isInSpanish
                ? "Usar mismas direcciones"
                : "Use same addresses",
              name: "use-same-addresses",
              type: "switchCheckbox",
              value: 1,
              required: true,
              width: 100,
              contClassNames: "same-address-checkbox-container",
              inpClassNames: "",
            },
            {
              label: isInSpanish
                ? "Dirección de Facturación"
                : "Billing Address",
              name: "billing-address-id",
              type: "select",
              options: userAddressesForDB || [],
              required: true,
              width: 100,
              contClassNames: "billing-address-container",
              inpClassNames: "",
            },
            {
              label: isInSpanish ? "Dirección de Envío" : "Shipping Address",
              name: "shipping-address-id",
              type: "select",
              options: userAddressesForDB || [],
              required: true,
              width: 100,
              contClassNames: "shipping-address-container",
              inpClassNames: "",
            },
          ],
          formClasses: "checkout-form",
        };

        const formToInsert = form(props);
        formWrapper.appendChild(formToInsert);
        //Activo lo de SemanticUI
        $(".ui.checkbox").checkbox();
        await addCheckoutFormDynamicButtons();
        cartExportObj.paintCheckoutPhoneSelect(); //Pinto los select del phone;
        cartExportObj.paintCheckoutAddressesSelect(); //Pinto los select de address
        listenToCheckoutFormTriggers(); //Esta funcion se fija las cosas que hace que shipping no aparezca
      } catch (error) {
        console.log(`Falle`);
        return console.log(error);
      }
    }
    //Agrega los botones de "add"
    async function addCheckoutFormDynamicButtons() {
      const shippingAddressFieldContainer = document.querySelector(
        ".shipping-address-container"
      );
      const billingAddressFieldContainer = document.querySelector(
        ".billing-address-container"
      );
      const phoneFieldContainer = document.querySelector(".phone-container");
      let buttonLabel = isInSpanish ? "Agregar" : "Add";
      // agrego los botones
      await addButton(
        phoneFieldContainer,
        buttonLabel,
        handleNewPhoneButtonClick
      );
      await addButton(
        shippingAddressFieldContainer,
        buttonLabel,
        handleNewAddressButtonClick
      );
      await addButton(
        billingAddressFieldContainer,
        buttonLabel,
        handleNewAddressButtonClick
      );
    }
    async function addButton(container, buttonText, cb) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = buttonText;
      button.className = "add-new-field-btn";
      button.addEventListener("click", async () => await cb());
      // Buscar el input dentro del container para posicionar el botón antes
      const input = container.querySelector("input, select, textarea"); // Busca el input, select o textarea
      if (input) {
        container.insertBefore(button, input); // Inserta el botón antes del input
      } else {
        // Si no se encuentra input, lo añade al final como fallback
        container.appendChild(button);
      }
    }
    //Pinta el select de los telefonos & addresses
    cartExportObj.paintCheckoutPhoneSelect = async function () {
      if (!countriesFromDB?.length) await setCountries();
      //Aca agarro el select del carro y lo repinto con todos los telefonos
      const userPhoneSelect = document.querySelector(
        '.checkout-section select[name="phone_id"]'
      );
      // Limpiar las opciones actuales
      userPhoneSelect.innerHTML = "";
      let options = userLogged
        ? userLogged.phones
        : getLocalStorageItem("guestPhones");
      // Agregar las nuevas opciones
      options?.forEach((option, i) => {
        if (i == 0) {
          //Primera opcion
          let firstOptionElement = document.createElement("option");
          firstOptionElement.value = "";
          firstOptionElement.textContent = isInSpanish
            ? "Elije un telefono"
            : "Choose a phone";
          firstOptionElement.disabled = true;
          firstOptionElement.selected = options.length > 1 ? true : false;
          userPhoneSelect.appendChild(firstOptionElement);
        }

        //Le pongo el pais
        let phoneCountry = option.country
          ? option.country
          : countriesFromDB?.find((count) => count.id == option.country_id);
        const optionElement = document.createElement("option");
        optionElement.value = option.id || "";
        optionElement.textContent = `(+${phoneCountry?.code}) ${option?.phone_number} `;
        optionElement.selected =
          options.length == 1 ? true : option.default ? true : false;
        userPhoneSelect.appendChild(optionElement);
      });
    };

    cartExportObj.paintCheckoutAddressesSelect = async function () {
      try {
        //Aca agarro el select del carro y lo repinto con todos las addresses
        const billingAddressSelect = document.querySelector(
          'select[name="billing-address-id"]'
        );
        const shippingAddressSelect = document.querySelector(
          'select[name="shipping-address-id"]'
        );
        let selectArray = [billingAddressSelect, shippingAddressSelect];
        selectArray.forEach((select) => {
          let valueSelected = select.value || null; //Si ya habia elegido lo dejo elegido por mas que pinte
          // Limpiar las opciones actuales
          select.innerHTML = "";
          let options = userLogged
            ? userLogged.addresses
            : getLocalStorageItem("guestAddresses");
          // Agregar las nuevas opciones
          options?.forEach((option, i) => {
            if (i == 0) {
              //Primera opcion
              let firstOptionElement = document.createElement("option");
              firstOptionElement.value = "";
              firstOptionElement.textContent = isInSpanish
                ? "Elije una direccion"
                : "Choose an address";
              firstOptionElement.disabled = true;
              firstOptionElement.selected = options.length > 1 ? true : false;
              select.appendChild(firstOptionElement);
            }
            //Le pongo el pais
            let optionAlreadySelected = option.id == valueSelected;
            const optionElement = document.createElement("option");
            optionElement.value = option.id || "";
            optionElement.textContent = `(${option?.label}) ${option?.street} | CP: ${option?.zip_code}`;
            //Basicamente si es el unico, si ya se habia seleccionado, o si es el default lo dejo seteado
            optionElement.selected =
              options.length == 1
                ? true
                : optionAlreadySelected
                ? true
                : option.default
                ? true
                : false;
            select.appendChild(optionElement);
          });
        });
        // Agrego la escucha para pintar el estimate cost
        shippingAddressSelect.addEventListener("change", async () => {
          // aca seteo el shipping cost
          setShippingCost();
          setDetailContainer();
          return;
        });
      } catch (error) {
        return console.log(error);
      }
    };
    //Esta funcion se fija los triggers para esconder shippingAddress
    function listenToCheckoutFormTriggers() {
      const shippingTypeSelect = document.querySelector(
        '.checkout-section select[name="shipping_type_id"]'
      );
      const useSameAddressCheckbox = document.querySelector(
        '.checkout-section input[name="use-same-addresses"]'
      );
      const useSameAddressCheckboxContainer = document.querySelector(
        ".checkout-section .same-address-checkbox-container"
      );
      const shippingAddressField = document.querySelector(
        ".shipping-address-container"
      );
      if (!useSameAddressCheckbox.dataset.listened) {
        useSameAddressCheckbox.dataset.listened = true;
        useSameAddressCheckbox.addEventListener("change", (e) => {
          setShippingCost();
          setDetailContainer();
          if (e.target.checked) {
            modifyBillingLabel(false); //cambio el label
            return shippingAddressField.classList.add("hidden");
          }
          modifyBillingLabel(true); // Cambio el label
          return shippingAddressField.classList.remove("hidden");
        });
      }
      if (!shippingTypeSelect.dataset.listened) {
        shippingTypeSelect.dataset.listened = true;
        shippingTypeSelect.addEventListener("change", (e) => {
          try {
            modifyBillingLabel(true)
            if (e.target.value == 1) {
              //Envio a domicilio, pinto el checkbox y el shipping Address
              shippingAddressField.classList.remove("hidden");
              setShippingCost();
              setDetailContainer();
              
              return useSameAddressCheckboxContainer.classList.remove("hidden");
            }
            //Aca pinto retiro por el local, escondo el checkbox y el shippingAddress y pongo el 0 shipping cost
            shippingAddressField.classList.add("hidden");
            useSameAddressCheckboxContainer.classList.add("hidden");
            useSameAddressCheckbox.checked = false; //Lo dejo false
            shippingCost = 0;
            shippingAddressField.querySelector("select").value = "";
            setDetailContainer();
            return;
          } catch (error) {
            return console.log(error);
          }
        });
      }
    }
    //Crea la tarjeta de Detalle
    function createCartDetailContainer() {
      const productsLength = cartProducts?.length || 0;
      let productsCost = 0;
      cartProducts?.forEach((cartItem) => {
        const productPrice = isInSpanish
          ? cartItem.product?.ars_price
          : cartItem.product?.usd_price;
        const itemQuantity = cartItem.quantity;
        productsCost += parseFloat(productPrice) * parseInt(itemQuantity);
      });
      const totalCost = displayBigNumbers(
        productsCost + parseFloat(shippingCost || 0)
      );

      // Crear contenedor principal
      const container = document.createElement("div");
      container.className = "cart-detail-container";

      // Crear título
      const title = document.createElement("p");
      title.className = "cart-detail-title page-title";
      title.textContent = isInSpanish ? "Detalle" : "Detail";
      container.appendChild(title);

      // Crear contenedor de detalles
      const detailListContainer = document.createElement("div");
      detailListContainer.className = "detail-list-container";

      // Crear fila: Número de productos
      const productRow = document.createElement("div");
      productRow.className = "detail-list-row";

      const productLengthElement = document.createElement("p");
      productLengthElement.className = "detail-row-p detail-row-product-length";
      productLengthElement.textContent = `${productsLength} ${
        isInSpanish ? "productos" : "products"
      }`;
      productRow.appendChild(productLengthElement);

      const productCost = document.createElement("p");
      productCost.className = "detail-row-p detail-row-product-cost";
      productCost.textContent = `$${displayBigNumbers(productsCost)}`;
      productRow.appendChild(productCost);

      detailListContainer.appendChild(productRow);

      // Crear fila: Envío
      const shippingRow = document.createElement("div");
      shippingRow.className = "detail-list-row";

      const shippingLabel = document.createElement("p");
      shippingLabel.className = "detail-row-p detail-row-shipping";
      shippingLabel.textContent = isInSpanish ? "Envio" : "Shipping";
      shippingRow.appendChild(shippingLabel);

      const shippingTypeSelect = document.querySelector(
        'select[name="shipping_type_id"]'
      );
      const shippingAddressSelect = document.querySelector(
        'select[name="shipping-address-id"]'
      );
      const shippingCostContainer = document.createElement("p");
      shippingCostContainer.className = "detail-row-p";
      // Si es 0 y no hay address seleccionada
      if (shippingCost == 0 && !shippingAddressSelect?.value) {
        if (shippingTypeSelect && shippingTypeSelect.value == 2) {
          shippingCostContainer.innerHTML = `<span class="detail-row-shipping-cost">-</span>`;
        } else if (!shippingTypeSelect || !shippingAddressSelect?.value) {
          shippingCostContainer.innerHTML = `<span class="detail-row-shipping-cost">${
            isInSpanish ? "A estimar" : "To estimate"
          }
          </span>`;
        }
      } else {
        //Aca o bien no es 0, o bien hay address => Seteo el shipping cost y lo pinto
        setShippingCost();
        shippingCostContainer.innerHTML = `<span class="detail-row-shipping-cost">$${displayBigNumbers(
          shippingCost
        )}</span>`;
      }
      shippingRow.appendChild(shippingCostContainer);

      detailListContainer.appendChild(shippingRow);

      // Crear fila: Total
      const totalRow = document.createElement("div");
      totalRow.className = "detail-list-row last-row";

      const totalLabel = document.createElement("p");
      totalLabel.className = "detail-row-p detail-row-total";
      totalLabel.textContent = "Total";
      totalRow.appendChild(totalLabel);

      const totalCostElement = document.createElement("p");
      totalCostElement.className = "detail-row-p detail-row-total-cost";
      totalCostElement.textContent = `$${totalCost}`;
      totalRow.appendChild(totalCostElement);

      detailListContainer.appendChild(totalRow);

      // Agregar contenedor de detalles al principal
      container.appendChild(detailListContainer);

      // Crear botón de finalizar compra
      const finalizeButton = document.createElement("button");
      finalizeButton.className =
        "ui button negative finalize-order-button section-handler-button";
      finalizeButton.type = "button";
      finalizeButton.textContent = isInSpanish
        ? "Finalizar compra"
        : "Go to checkout";
      container.appendChild(finalizeButton);

      return container;
    }
    //Define los cart product dependiendo si esta loggeado o no
    async function setCartProducts() {
      cartProducts = userLogged
        ? userLogged.tempCartItems || []
        : getLocalStorageItem("cartItems") || []; //seteo el cartProduct
      const variationIdsToFetch = cartProducts?.map(
        (item) => item.variation_id
      ); //Dejo el array de ids para hacer fetch

      if (!variationIdsToFetch || !variationIdsToFetch.length) return;
      await setVariationsFromDB(variationIdsToFetch); //seteo los variations
      if (!variationsFromDB.length) return;
      let indexesToRemoveFromCart = [];
      cartProducts.forEach((cartItem,i) => {
        const variationFromDB = variationsFromDB?.find(
          (variation) => variation.id == cartItem.variation_id
        );
        //Aca lo dejo seteado con las entidades
        cartItem.product = variationFromDB?.product;
        cartItem.size = variationFromDB?.size;
        cartItem.taco = variationFromDB?.taco;
        cartItem.maxQuantityAvailable = variationFromDB?.quantity;
        //Si esta pidiendo mas le dejo el stock que tiene el producto
        if(cartItem.quantity > variationFromDB?.quantity) {
          if(variationFromDB.quantity == 0){
            indexesToRemoveFromCart.push(i)
          }
          
          cartItem.quantity = variationFromDB?.quantity;
        }
      });
      //si hay productos sin stock los saco antes de pintarlos
      cartProducts = indexesToRemoveFromCart.length ? removeIndexesFromArray(cartProducts,indexesToRemoveFromCart) : cartProducts;
      
      return;
    }
    function updateGuestCart() {
      const checkoutCards = Array.from(
        document.querySelectorAll(".checkout-card")
      );
      // Aca borro y vuelvo a armar el local
      deleteLocalStorageItem("cartItems");
      checkoutCards.forEach((card) => {
        let cartProduct = cartProducts.find(
          (cartItem) => cartItem.variation_id == card.dataset.variation_id
        );
        if (!cartProduct) return;
        cartProduct.quantity = card.querySelector(
          ".card_product_amount"
        ).innerText;
        delete cartProduct.productFromDB;
        setLocalStorageItem("cartItems", cartProduct, true);
      });
    };

    function setShippingCost() {
      // Convierte el array en un Map para acceso rápido
      const countriesMap = new Map(
        countriesFromDB.map((dbCountry) => [dbCountry.id, dbCountry])
      );
      const useSameAddressCheckbox = document.querySelector(
        'input[name="use-same-addresses"]'
      );
      const shippingAddressSelect = document.querySelector(
        'select[name="shipping-address-id"]'
      );
      const billingAddressSelect = document.querySelector(
        'select[name="billing-address-id"]'
      );
      const addressID = useSameAddressCheckbox.checked
        ? billingAddressSelect.value
        : shippingAddressSelect?.value;
      let addressToUse = userLogged
        ? userLogged.addresses
        : getLocalStorageItem("guestAddresses");
      let address = addressToUse.find((add) => add.id == addressID);

      if (!address) return (shippingCost = 0);
      const countryFromDB = countriesMap.get(address?.country_id);
      let zoneFromDB = shippingZonesFromDB?.find(
        (zone) => zone.id == countryFromDB?.zone_id
      );

      if (!zoneFromDB) return (shippingAddressSelect.value = ""); //Reinicio la direc, no dejo seguir
      shippingCost = isInSpanish
        ? zoneFromDB?.price?.ars_price || 0
        : zoneFromDB?.price?.usd_price || 0;
    };

    function generateCheckoutFormBodyToFetch(form) {
      let bodyData = {
        user_id: userLogged ? userLogged.id : null,
        first_name: form["first_name"].value,
        last_name: form["last_name"].value,
        email: form["email"].value,
        dni: form["dni"].value,
        payment_type_id: userLogged
          ? userLogged.payment_type_id
          : getLocalStorageItem("payment_type_id"), //TODO:
        shipping_type_id: form["shipping_type_id"].value,
        variations: [],
      };
      // Ahora voy por phone,shipping & billing, y variations
      // Se supone que aca ya tengo actualizado o bien cartItems o bien el userLogged, acceso a eso
      let cart = userLogged
        ? userLogged.tempCartItems
        : getLocalStorageItem("cartItems");
      cart = cart.map((tempCartItem) => ({
        id: tempCartItem.variation_id,
        quantityRequested: tempCartItem.quantity,
      }));
      bodyData.variations = cart;
      // Ahora el phone
      const phoneID = form["phone_id"].value;
      let phoneArrayToLook = userLogged
        ? userLogged.phones
        : getLocalStorageItem("guestPhones");
      let phoneObj = phoneArrayToLook?.find((dbPhone) => dbPhone.id == phoneID);
      bodyData.phoneObj = phoneObj;
      // Ahora las addresses
      let addressArrayToLook = userLogged
        ? userLogged.addresses
        : getLocalStorageItem("guestAddresses");
      const billingAddressId = form["billing-address-id"].value;
      let billingAddressObj = addressArrayToLook?.find(
        (dbAddress) => dbAddress.id == billingAddressId
      );
      bodyData.billingAddress = billingAddressObj;
      const useSameAddress = form["use-same-addresses"].checked;
      if (useSameAddress) {
        bodyData.shippingAddress = billingAddressObj; //Usa la misma
      } else {
        //Aca la busco
        const shippingAddressId = form["shipping-address-id"].value;
        let shippingAddressObj = addressArrayToLook?.find(
          (dbAddress) => dbAddress.id == shippingAddressId
        );
        bodyData.shippingAddress = shippingAddressObj;
      }

      return bodyData;
    };
    function modifyBillingLabel(justBilling) {
      //ESto modifica la label del form
      const billingAddressLabel = document.querySelector(
        ".billing-address-container>label"
      );
      if (justBilling) {
        billingAddressLabel.textContent = isInSpanish
          ? "Dirección de Facturación"
          : "Billing Address";
        return;
      }
      billingAddressLabel.textContent = isInSpanish
        ? "Dirección de Facturación & Envio"
        : "Billing & Shipping Address";
      return;
    };
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
});

export { cartExportObj };
