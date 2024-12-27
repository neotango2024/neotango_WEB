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
import {
  activateContainerLoader,
  activateDropdown,
  createModal,
  handlePageModal,
  productsFromDB,
  setProductsFromDB,
} from "./utils.js";

window.addEventListener("load", async () => {
  try {
    const main = document.querySelector(".main");
    //Activo el loader
    activateContainerLoader(main, true);
    //seteo los productos TODO: Esto es con los productos del carro
    await setProductsFromDB();
    console.log(productsFromDB);
    
    activateContainerLoader(main, false);
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
    checkForSectionButtons();
    function checkForSectionButtons() {
      const sectionButtons = document.querySelectorAll(
        ".section-handler-button"
      );
      sectionButtons.forEach((btn) => {
        if (btn.dataset.listened) return;
        btn.dataset.listened = true;
        btn.addEventListener("click", async () => {
          try {
            if (btn.classList.contains("finalize-order-button")) {
              await generateCheckoutForm();
              //TODO: Aca hago fetch para cambiar el estado del carro
              return main.classList.add("active");
            }
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

    async function generateCheckoutForm() {
      try {
        const formWrapper = document.querySelector(".form-wrapper");
        formWrapper.innerHTML = "";
        // Primero pido los types que necesito si es que no estan
        if (!paymentTypesFromDB.length) {
          await setPaymentTypes();
        }
        if (!shippingTypesFromDB.length) {
          await setShippingTypes();
        }
        let shippingTypesForSelect = shippingTypesFromDB?.map((type) => ({
          value: type.id,
          label: type.type.en, //TODO: IDIOMA
        }));
        let paymentTypesForSelect = paymentTypesFromDB?.map((type) => ({
          value: type.id,
          label: type.type, //TODO: IDIOMA
        }));
        let userAddressesForDB = userLogged?.addresses?.map((address) => ({
          value: address.id,
          label: `${address.street} (${address.label})`,
        }));
        const props = {
          formTitle: "Checkout Form",
          formAction: "/api/order", // Cambiar a la ruta deseada
          method: "POST",
          inputProps: [
            {
              label: "First Name",
              name: "first_name",
              placeholder: "Enter your first name",
              required: true,
              width: 40,
              value: userLogged?.first_name || null,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: "Last Name",
              name: "last_name",
              placeholder: "Enter your last name",
              required: true,
              width: 40,
              value: userLogged?.last_name || null,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: "Email",
              name: "email",
              type: "email",
              placeholder: "Enter your email",
              required: true,
              width: 100,
              value: userLogged?.email || null,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: "DNI",
              name: "dni",
              placeholder: "Enter your DNI",
              required: true,
              width: 100,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: "Phone",
              name: "phoneObj.phone_number",
              type: "select", // Indica que será un select
              options: userLogged?.phones || [],
              required: true,
              width: 100,
              contClassNames: "phone-container",
              inpClassNames: "",
            },
            {
              label: "Shipping Type",
              name: "shipping_types_id",
              type: "select",
              options: shippingTypesForSelect,
              required: true,
              width: 100,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: "Billing Address",
              name: "billingAddress.id",
              type: "select",
              options: userAddressesForDB || [],
              required: true,
              width: 100,
              contClassNames: "billing-address-container",
              inpClassNames: "",
            },
            {
              label: "Use same addresses",
              name: "use-same-addresses",
              type: "checkbox",
              value: 1,
              required: true,
              width: 100,
              contClassNames: "",
              inpClassNames: "",
            },
            {
              label: "Shipping Address",
              name: "shippingAddress.id",
              type: "select",
              options: userAddressesForDB || [],
              required: true,
              width: 100,
              contClassNames: "shipping-address-container",
              inpClassNames: "",
            },
            {
              label: "Payment Type",
              name: "payment_types_id",
              type: "select",
              options: paymentTypesForSelect,
              required: true,
              width: 100,
              contClassNames: "",
              inpClassNames: "",
            },
          ],
        };
        const formToInsert = form(props);
        formWrapper.appendChild(formToInsert);
        await addCheckoutFormDynamicButtons();
      } catch (error) {
        console.log(`Falle`);
        return console.log(error);
      }
    }
    async function addCheckoutFormDynamicButtons() {
      const shippingAddressFieldContainer = document.querySelector(
        ".shipping-address-container"
      );
      const billingAddressFieldContainer = document.querySelector(
        ".billing-address-container"
      );
      const phoneFieldContainer = document.querySelector(".phone-container");

      // agrego los botones
      await addButton(
        phoneFieldContainer,
        "Add New",
        handlePhoneButtonClick
      );
      await addButton(
        shippingAddressFieldContainer,
        "Add New",
        handleAddressButtonClick
      );
      await addButton(
        billingAddressFieldContainer,
        "Add New",
        handleAddressButtonClick
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
    
    const handlePhoneButtonClick = async ()=>{
        await createPhoneModal();
        // Abro el modal
        handlePageModal(true);
        await listenToPhoneCreateBtn()//hago el fetch para crear ese telefono
      }
    const handleAddressButtonClick = async ()=>{
        await createAddressModal();
        // Abro el modal
        handlePageModal(true);
      }
      async function listenToPhoneCreateBtn(){
        
      }
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
});
