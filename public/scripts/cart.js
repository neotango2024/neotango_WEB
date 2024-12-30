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
import { getLocalStorageItem } from "./localStorage.js";
import {
  activateContainerLoader,
  activateDropdown,
  buildAddressBodyData,
  buildPhoneBodyData,
  generateRandomString,
  getFromSessionStorage,
  handleAddressCreateFetch,
  handleModalCheckForComplete,
  handleModalCreation,
  handlePageModal,
  handlePhoneCreateFetch,
  isInDesktop,
  productsFromDB,
  saveToSessionStorage,
  setProductsFromDB,
  updateAddressElements,
  updatePhoneElements,
} from "./utils.js";
let exportObj = {
  generateCheckoutForm: null,
  setDetailContainer: null,
  paintCheckoutPhoneSelect: null,
  paintCheckoutAddressesSelect: null
}
window.addEventListener("load", async () => {
  try {
    const main = document.querySelector(".main");
    //Activo el loader
    activateContainerLoader(main, true);
    //seteo los productos TODO: Esto es con los productos del carro
    let cartProducts = [];
    if(userLogged){
      cartProducts = userLogged.cartItems;
    } else{
      cartProducts = getLocalStorageItem('cartItems') || [];
    }
    await setProductsFromDB();    
    activateContainerLoader(main, false);
    //Pinta la seccion de detalle
    exportObj.setDetailContainer = function(){
      const containersToAppend = document.querySelectorAll('.cart-detail-rail-container');      
      containersToAppend.forEach(cont => {
        cont.innerHTML = ''
        //Lo genero
        let newDetailContainer = createCartDetailContainer();
        // Reemplazar el contenedor antiguo con el nuevo
        cont.appendChild(newDetailContainer);
      });
      checkForSectionButtons(); //Para los botones de "finalizar compra" o directo el de mp
    }
    
    //Pinto el detalle
    exportObj.setDetailContainer();

    const cartProductsWrapper = document.querySelector(
      ".cart-products-cards-wrapper"
    );
    if (productsFromDB?.length) {
      productsFromDB.forEach((prod) => {
        const checkoutCardElement = checkoutCard(prod);
        cartProductsWrapper.appendChild(checkoutCardElement);
      });
      //Ahora escucho los botones
      checkCheckoutButtons();
      // Pinto el detail
      modifyDetailList();
    }
    function checkForSectionButtons() {
      const sectionButtons = document.querySelectorAll(
        ".section-handler-button"
      );
      sectionButtons.forEach((btn) => {
        if (btn.dataset.listened) return;
        btn.dataset.listened = true;
        btn.addEventListener("click", async () => {          
          window.scrollTo(0,0)
          try {
            if (btn.classList.contains("finalize-order-button")) {
              await exportObj.generateCheckoutForm();
              exportObj.setDetailContainer();
              //TODO: Aca hago fetch para cambiar el estado del carro
              return main.classList.add("active");
            }
            //ACa limipio el checkout section
            const checkoutSectionForm = document.querySelector('.checkout-section .form-wrapper');
            checkoutSectionForm.innerHTML = '';
            return main.classList.remove("active");
          } catch (error) {
            console.log("Falle");
            return console.log(error);
          }
        });
      });
    }
    function checkCheckoutButtons() {
      const checkoutCards = document.querySelectorAll(".checkout-card");
      checkoutCards.forEach((card) => {
        if (card.dataset.listened) return;
        card.dataset.listened = true;
        const addBtn = card.querySelector(".add_more_product");
        const minusBtn = card.querySelector(".remove_more_product");
        const removeBtn = card.querySelector(".remove_card_btn");
        const cardPrice = card.querySelector(".card_price");
        const productPrice = card.dataset.price;
        addBtn.addEventListener("click", () => {
          let actualQuantitySpan = card.querySelector(".card_product_amount");
          actualQuantitySpan.innerHTML =
            parseInt(actualQuantitySpan.innerHTML) + 1;
          if (actualQuantitySpan.innerHTML > 1) {
            //Si es mas de 1 cambio clases
            minusBtn.classList.remove("hidden");
            removeBtn.classList.add("hidden");
          }
          cardPrice.innerHTML = `$${
            parseInt(actualQuantitySpan.innerHTML) * productPrice
          }`;
          modifyDetailList();
        });
        minusBtn.addEventListener("click", () => {
          let actualQuantitySpan = card.querySelector(".card_product_amount");
          actualQuantitySpan.innerHTML =
            parseInt(actualQuantitySpan.innerHTML) - 1;
          if (actualQuantitySpan.innerHTML == 1) {
            //Si es 1 cambio clases
            minusBtn.classList.add("hidden");
            removeBtn.classList.remove("hidden");
          }
          cardPrice.innerHTML = `$${
            parseInt(actualQuantitySpan.innerHTML) * productPrice
          }`;
          modifyDetailList();
        });
        removeBtn.addEventListener("click", () => {
          card.remove();
          modifyDetailList();
        });
      });
    }

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
      let shippingCostElement = document.querySelector(
        ".detail-row-shipping-cost"
      ).innerText;
      let totalCost = parseFloat(shippingCostElement); //al principio es solo el shipping
      let productCost = 0;
      productCards.forEach((card) => {
        const unityPrice = parseFloat(card.dataset.price);
        const totalUnits = parseInt(
          card.querySelector(".card_product_amount").innerText
        );
        productCost += unityPrice * totalUnits;
        totalCost += unityPrice * totalUnits;
      });
      productLengthElement.innerHTML = `${productLength} producto${
        productLength == 1 ? "" : "s"
      }`;
      productCostElement.innerHTML = `$${productCost}`;
      totalCostElement.innerHTML = `$${totalCost}`;
    }

    exportObj.generateCheckoutForm = async () => {
      try {
        const formWrapper = document.querySelector(".form-wrapper");
        formWrapper.innerHTML = "";
        let shortInputWidth =  isInDesktop() ? 40 : 100;
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
            placeholder: isInSpanish ? "Ingresa tu nombre" : "Enter your first name",
            required: true,
            width: shortInputWidth,
            value: userLogged?.first_name || null,
            contClassNames: "",
            inpClassNames: "",
          },
          {
            label: isInSpanish ? "Apellido" : "Last Name",
            name: "last_name",
            placeholder: isInSpanish ? "Ingresa tu apellido" : "Enter your last name",
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
            placeholder: isInSpanish ? "Ingresa tu correo electrónico" : "Enter your email",
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
            label: isInSpanish ? "Usar mismas direcciones" : "Use same addresses",
            name: "use-same-addresses",
            type: "switchCheckbox",
            value: 1,
            required: true,
            width: 100,
            contClassNames: "same-address-checkbox-container",
            inpClassNames: "",
          },
          {
            label: isInSpanish ? "Dirección de Facturación" : "Billing Address",
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
      };
      
        const formToInsert = form(props);
        formWrapper.appendChild(formToInsert);
        //Activo lo de SemanticUI
        $('.ui.checkbox').checkbox();
        await addCheckoutFormDynamicButtons();
        exportObj.paintCheckoutPhoneSelect(); //Pinto los select del phone;
        exportObj.paintCheckoutAddressesSelect();//Pinto los select de address
        listenToCheckoutFormTriggers(); //Esta funcion se fija las cosas que hace que shipping no aparezca
      } catch (error) {
        console.log(`Falle`);
        return console.log(error);
      }
    };

    async function addCheckoutFormDynamicButtons() {
      const shippingAddressFieldContainer = document.querySelector(
        ".shipping-address-container"
      );
      const billingAddressFieldContainer = document.querySelector(
        ".billing-address-container"
      );
      const phoneFieldContainer = document.querySelector(".phone-container");
      let buttonLabel = isInSpanish ? "Agregar":"Add"
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
    async function addButton(container, buttonText,cb) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = buttonText;
      button.className = 'add-new-field-btn'
      button.addEventListener('click', await cb)
      // Buscar el input dentro del container para posicionar el botón antes
        const input = container.querySelector("input, select, textarea"); // Busca el input, select o textarea
        if (input) {
            container.insertBefore(button, input); // Inserta el botón antes del input
        } else {
            // Si no se encuentra input, lo añade al final como fallback
            container.appendChild(button);
        }
    }
    
    //Estas funciones pintan y activan el modal de telefonos/direcciones
    const handleNewPhoneButtonClick = async ()=>{
        await createPhoneModal();
        // Abro el modal
        handlePageModal(true);
        // await listenToPhoneCreateBtn()//hago el fetch para crear ese telefono
        await handleModalCreation({
          entityType: 'phone',
          buildBodyData: buildPhoneBodyData,
          saveGuestEntity: (bodyData) => saveToSessionStorage(bodyData, "guestPhones", true), //El true es porque es array
          updateElements: updatePhoneElements, // Funcion que actualiza el select de phones,
          postToDatabase: handlePhoneCreateFetch
        })//hago el fetch para crear ese telefono
    }
    const handleNewAddressButtonClick = async ()=>{
        await createAddressModal();
        // Abro el modal
        handlePageModal(true);
        await handleModalCreation({
          entityType: 'address',
          buildBodyData: buildAddressBodyData,
          saveGuestEntity: (bodyData) => saveToSessionStorage(bodyData, "guestAddresses", true), //El true es porque es array
          updateElements: updateAddressElements, // Funcion que actualiza el select de phones
          postToDatabase: handleAddressCreateFetch
        })//hago el fetch para crear esa address
    };
    
    
    //Pinta el select de los telefonos & addresses
    exportObj.paintCheckoutPhoneSelect =  async function(){
      if(!countriesFromDB?.length) await setCountries();
      //Aca agarro el select del carro y lo repinto con todos los telefonos
      const userPhoneSelect = document.querySelector('.checkout-section select[name="phone_id"]');
      // Limpiar las opciones actuales
      userPhoneSelect.innerHTML = "";
      let options = userLogged ? userLogged.phones : getFromSessionStorage('guestPhones');
      // Agregar las nuevas opciones
      options?.forEach((option,i) => {
        if(i == 0){
          //Primera opcion
          let firstOptionElement = document.createElement("option");
          firstOptionElement.value = "";
          firstOptionElement.textContent = isInSpanish ? "Elije un telefono" : "Choose a phone";
          firstOptionElement.disabled = true;
          firstOptionElement.selected = options.length > 1 ? true : false;
          userPhoneSelect.appendChild(firstOptionElement);
        }
        //Le pongo el pais
        let phoneCountry = option.country ? option.country : countriesFromDB?.find(count=>count.id == option.country_id);
        const optionElement = document.createElement("option");
        optionElement.value = option.id || "";
        optionElement.textContent = `(+${phoneCountry?.code}) ${option?.phone_number} `;
        optionElement.selected = options.length == 1 ? true : false;
        userPhoneSelect.appendChild(optionElement);
      });
    };

    exportObj.paintCheckoutAddressesSelect = async function(){
      try {
        //Aca agarro el select del carro y lo repinto con todos los telefonos
      const billingAddressSelect = document.querySelector('select[name="billing-address-id"]');
      const shippingAddressSelect = document.querySelector('select[name="shipping-address-id"]');
      let selectArray = [billingAddressSelect,shippingAddressSelect];      
      selectArray.forEach(select=>{
        let valueSelected = select.value || null; //Si ya habia elegido lo dejo elegido por mas que pinte
        // Limpiar las opciones actuales
        select.innerHTML = "";
        let options = userLogged ? userLogged.addresses : getFromSessionStorage('guestAddresses');
        // Agregar las nuevas opciones
        options?.forEach((option,i) => {
        if(i == 0){
          //Primera opcion
          let firstOptionElement = document.createElement("option");
          firstOptionElement.value = "";
          firstOptionElement.textContent = isInSpanish ? "Elije una direccion" : "Choose an address";
          firstOptionElement.disabled = true;
          firstOptionElement.selected = options.length > 1 ? true : false;
          select.appendChild(firstOptionElement);
        }
        //Le pongo el pais
        let optionAlreadySelected = option.id == valueSelected;
        const optionElement = document.createElement("option");
        optionElement.value = option.id || "";
        optionElement.textContent = `(${option?.label}) ${option?.street} | CP: ${option?.zip_code}`;
        optionElement.selected = options.length == 1 ? true : optionAlreadySelected ? true : false;
        select.appendChild(optionElement);
        });
      })
      } catch (error) {
        return console.log(error);
        
      }
    };
    //Esta funcion se fija los triggers para esconder shippingAddress
    function listenToCheckoutFormTriggers(){
      const shippingTypeSelect = document.querySelector('.checkout-section select[name="shipping_type_id"]');
      const useSameAddressCheckbox = document.querySelector('.checkout-section input[name="use-same-addresses"]');
      const useSameAddressCheckboxContainer = document.querySelector('.checkout-section .same-address-checkbox-container');
      const shippingAddressField = document.querySelector('.shipping-address-container');
      if(!useSameAddressCheckbox.dataset.listened){
        useSameAddressCheckbox.dataset.listened = true;
        useSameAddressCheckbox.addEventListener('change',(e)=>{
          if(e.target.checked)return shippingAddressField.classList.add('hidden');
          return shippingAddressField.classList.remove('hidden');
        })
      }
      if(!shippingTypeSelect.dataset.listened){
        shippingTypeSelect.dataset.listened = true;
        shippingTypeSelect.addEventListener('change',(e)=>{
          if(e.target.value == 1){
            //Envio a domicilio, pinto el checkbox y el shipping Address
            shippingAddressField.classList.remove('hidden');
            return useSameAddressCheckboxContainer.classList.remove('hidden');
          }
          //Aca pinto retiro por el local, escondo el checkbox y el shippingAddress
          shippingAddressField.classList.add('hidden');
          useSameAddressCheckboxContainer.classList.add('hidden');
          useSameAddressCheckbox.checked = false; //Lo dejo false
          return
        })
      }
    }

    
    function createCartDetailContainer() {
      //TODO: Ver productLength, productsCost con el carro
      const productsLength = 10;
      const productsCost = 150;
      const shippingCost = 20;
      const totalCost = 170;

      // Crear contenedor principal
      const container = document.createElement("div");
      container.className = "cart-detail-container";
  
      // Crear título
      const title = document.createElement("p");
      title.className = "cart-detail-title page-title";
      title.textContent = isInSpanish ? "Detalle": "Detail";
      container.appendChild(title);
  
      // Crear contenedor de detalles
      const detailListContainer = document.createElement("div");
      detailListContainer.className = "detail-list-container";
  
      // Crear fila: Número de productos
      const productRow = document.createElement("div");
      productRow.className = "detail-list-row";
  
      const productLengthElement = document.createElement("p");
      productLengthElement.className = "detail-row-p detail-row-product-length";
      productLengthElement.textContent = `${productsLength} ${isInSpanish ? 'productos' : 'products'}`; 
      productRow.appendChild(productLengthElement);
  
      const productCost = document.createElement("p");
      productCost.className = "detail-row-p detail-row-product-cost";
      productCost.textContent = `$${productsCost}`;
      productRow.appendChild(productCost);
  
      detailListContainer.appendChild(productRow);
  
      // Crear fila: Envío
      const shippingRow = document.createElement("div");
      shippingRow.className = "detail-list-row";
  
      const shippingLabel = document.createElement("p");
      shippingLabel.className = "detail-row-p detail-row-shipping";
      shippingLabel.textContent = isInSpanish ? "Envio" : "Shipping"; 
      shippingRow.appendChild(shippingLabel);
  
      const shippingCostContainer = document.createElement("p");
      shippingCostContainer.className = "detail-row-p";
      shippingCostContainer.innerHTML = `$<span class="detail-row-shipping-cost">${shippingCost}</span>`;
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
      finalizeButton.className = "ui button negative finalize-order-button section-handler-button";
      finalizeButton.type = "button";
      finalizeButton.textContent = isInSpanish ? "Finalizar compra" : "Go to checkout"; 
      container.appendChild(finalizeButton);
  
      return container;
  }
  
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
});


export {exportObj}