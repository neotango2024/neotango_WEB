import { cartExportObj } from "./cart.js";
import { checkForUserLogged, userLogged } from "./checkForUserLogged.js";
import {
  closeModal,
  createAddressModal,
  createPhoneModal,
  createUserSignUpModal,
  disableAddressModal,
  disablePhoneModal,
  generateTooltip,
} from "./componentRenderer.js";
import { countriesFromDB } from "./getStaticTypesFromDB.js";
import { headerExportObject } from "./header.js";
import { decideLanguageInsertion, isInSpanish } from "./languageHandler.js";
import { deleteLocalStorageItem, getLocalStorageItem, setLocalStorageItem } from "./localStorage.js";
import { userProfileExportObj } from "./userProfile.js";

export function activateAccordions() {
  $(".ui.accordion").accordion(); // Activa los acordeones
}
export function initiateMenuBtn() {
  // Logica para boton + mobile
  $(".ui.dropdown.user-menu-btn").dropdown({
    direction: "upward",
    keepOnScreen: true,
    context: window,
  });
}
// Logica para que todos los inputs numericos no acepten letras
export function checkForNumericInputs() {
  let numericInputs = document.querySelectorAll(".numeric-only-input");
  numericInputs.forEach((input) => {
    if(input.dataset.listened)return;
    input.dataset.listened = true;
    // Tomo el ultimo valor
    let lastInputValue = input.value;
    input.addEventListener("input", function (e) {
      var inputValueArray = e.target.value.split("");
      let flag = true;
      //Esto es para que me permita poner espacios
      inputValueArray.forEach((value) => {
        if (!isNumber(value) && value != " ") flag = false;
      });

      if (!flag) {
        // Si no es un número, borra el contenido del campo
        e.target.value = lastInputValue;
      } else {
        lastInputValue = e.target.value; // Almacenar el último valor válido
      }
    });
  });
}

// Logica para todos los inputs float
export function checkForFloatInputs() {
  let floatInputs = document.querySelectorAll(".float-only-input");
  floatInputs.forEach((input) => {
    if (input.dataset.listened) return;
    input.dataset.listened = true;
    // Tomo el ultimo valor
    let lastInputValue = input.value;
    input.addEventListener("input", function (e) {
      var inputValue = e.target.value;
      // Reemplazar ',' por '.'
      inputValue = inputValue.replace(",", ".");
      if (!isFloat(inputValue)) {
        // Si no es un número, borra el contenido del campo
        e.target.value = lastInputValue;
      } else {
        // Actualizar el campo con el valor modificado
        e.target.value = inputValue;
        lastInputValue = inputValue; // Almacenar el último valor válido
      }
    });
  });
}

// Devuelve true si es todo numerico el valor
export function isNumber(value) {
  return /^[0-9]*$/.test(value);
}
// Devuelve true si es todo numerico el valor
export function isFloat(value) {
  return /^[0-9]*\.?[0-9]*$/.test(value);
}

//Toglea las classes del overlay
export const toggleOverlay = () => {
  const overlay = document.querySelector(".overlay");
  overlay.classList.toggle("overlay-active");
};

export const toggleBodyScrollableBehavior = () => {
  const body = document.querySelector("body");
  body.classList.toggle("non-scrollable");
};
export function generateRandomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

export let productsFromDB = [];
export async function setProductsFromDB({
  categoryId = null,
  limit = null,
  offset = null,
  id = null,
} = {}) {
  try {
    const fetchedArray = await fetchDBProducts({
      categoryId,
      limit,
      offset,
      id,
    });

    productsFromDB = fetchedArray;
  } catch (error) {
    console.log(`Falle en setProductsFromDB:`);
    return console.log(error);
  }
}

export async function fetchDBProducts({
  categoryId = null,
  limit = null,
  offset = null,
  id = null,
} = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (categoryId) queryParams.append("categoryId", categoryId);
    if (limit) queryParams.append("limit", limit);
    if (offset) queryParams.append("offset", offset);
    // Agregar los valores del array `id` a los parámetros de la query
    if (Array.isArray(id)) {
      id.forEach((value) => queryParams.append("productId", value));
    } else if (id) {
      queryParams.append("productId", id);
    }
    const url = `${
      window.location.origin
    }/api/product?${queryParams.toString()}`;

    let array = (await (await fetch(url)).json()).data || [];

    return array;
  } catch (error) {
    console.log(`Falle en fetchDBProducts`);
    return console.log(error);
  }
}

export let ordersFromDB = [];
export const setOrdersFromDB = async () => {
  const response = await fetch("/api/order");
  const data = await response.json();
  ordersFromDB = data.orders;
};

export let variationsFromDB = [];
export async function setVariationsFromDB(id) {
  try {
    const queryParams = new URLSearchParams();
    // Agregar los valores del array `id` a los parámetros de la query
    if (Array.isArray(id)) {
      id.forEach((value) => queryParams.append("variationId", value));
    } else if (id) {
      queryParams.append("variationId", id);
    }
    const url = `${
      window.location.origin
    }/api/variation?${queryParams.toString()}`;

    let array = (await (await fetch(url)).json()).data || [];
    variationsFromDB = array;
  } catch (error) {
    console.log(`Falle en setVariationsFromDB: ${error}`);
  }
}

export let shippingZonesFromDB = [];
export const setShippingZones = async () => {
  const response = await fetch("/api/shipping/zones");
  const responseJson = await response.json();
  shippingZonesFromDB = responseJson.data;
};

//busca y pinta el primer loader de un contenedor
export function activateContainerLoader(cont, boolean) {
  const loaderToPaint = cont.querySelector(".ui.dimmer");
  if (!loaderToPaint) return;
  if (boolean) return loaderToPaint.classList.add("active");
  return loaderToPaint.classList.remove("active");
}

// crea y abre los modals
export function handlePageModal(boolean) {
  if (boolean) {
    //Abro el popup
    $(".ui.modal").modal({
      keyboardShortcuts: false,
      observeChanges: true,
      centered: false,
    });
    $(".ui.modal").modal("show");
    // document.body.classList.add("scrolling");
    return;
  }
  // Aca lo cierro
  closeModal();
  return;
}

export function activateDropdown({ className, array, placeHolder, values }) {
  $(className)?.each(function () {
    let search = $(this);
    if (array?.length) {
      // Reemplazar el select por uno nuevo vacío
      // Crear un nuevo elemento <select>
      const newSelect = $("<select>");

      // Copiar las clases
      newSelect.attr("class", search.attr("class"));

      // Copiar el nombre
      newSelect.attr("name", search.attr("name"));

      // Copiar otros atributos estándar
      if (search.attr("multiple") !== undefined) {
        newSelect.attr("multiple", "");
      }
      if (search.attr("required") !== undefined) {
        newSelect.attr("required", "");
      }

      // Copiar todos los data-* attributes
      $.each(search.data(), (key, value) => {
        newSelect.attr(`data-${key}`, value);
      });

      search.replaceWith(newSelect);

      // Actualizar la referencia a `search` para apuntar al nuevo select
      search = newSelect;
      const object = {
        element: search,
        array: array,
        firstOption: placeHolder,
      };
      const elem = object.element;
      elem.empty(); // Vaciar el contenido del elemento
      object.array?.forEach((arrayElem, i) => {
        if (!arrayElem?.name) return; //No incluyo aquellos paises que no tienen code
        let option;
        if (i == 0) {
          option = $("<option>", {
            value: "",
            html: object.firstOption,
          });
          elem.append(option);
        }
        option = $("<option>", {
          value: arrayElem.id,
          html: arrayElem.name,
        });
        elem.append(option);
      });
      // Hacer algo si hay más de una opción
      elem.dropdown("set selected", values).dropdown({
        fullTextSearch: "exact",
        showOnFocus: false,
        clearable: true,
        forceSelection: false,
      });
    }
  });
}

export function activateCheckboxTogglers() {
  $(".ui.checkbox").checkbox();
}
// Se fija si esta en desktop
export function isInDesktop() {
  return window.innerWidth >= 1024; // Mobile & Tablet
}
// Se fija si esta en desktop
export function isInMobile() {
  return window.innerWidth < 768; // Mobile
}

// Se fija que el modal este completo
export function handleModalCheckForComplete() {
  const submitButton = document.querySelector(".ui.modal .send-modal-form-btn");
  const errorsContainer = document.querySelector(".ui.error.message");
  const modalForm = document.querySelector(".ui.form");
  modalForm.classList.remove("error"); // le saco el error
  submitButton.classList.add("basic"); //Lo dejo basic antes
  let formIsComplete = checkForAllModalRequiredFields();
  if (!formIsComplete) {
    submitButton.classList.remove("basic"); //Lo dejo full rojo
    modalForm.classList.add("error"); //Le agrego el rojo
    errorsContainer.innerHTML = `<p>${
      isInSpanish
        ? "Debes completar todos los campos requeridos"
        : "You have to complete all required fields"
    }</p>`;
    return false;
  }
  return true;
}

function checkForAllModalRequiredFields() {
  const modalRequiredFields = document.querySelectorAll(
    ".ui.modal input[required], .ui.modal select[required], .ui.modal textarea[required]"
  );
  let flag = true;
  modalRequiredFields.forEach((element) => {
    let field = element.closest(".field");
    field.classList.remove("error");
    if (!element.value) {
      flag = false;
      field.classList.add("error");
    }
    //De paso le agrego si no tiene el listened un event change para sacarle la clase
    if (!element.dataset.listened) {
      element.dataset.listened = true;
      element.addEventListener("input", (e) => {
        let field = element.closest(".field");
        e.target.value
          ? field.classList.remove("error")
          : field.classList.add("error");
      });
    }
  });
  return flag;
}

//Esto maneja todos los post que se hacen en un modal, para ver los parametros en cart.js se invoca
export async function handleModalCreation({
  entityType,
  buildBodyData,
  saveGuestEntity,
  updateElements,
  postToDatabase,
  validateFormFunction,
  method,
}) {
  try {
    const modal = document.querySelector(".ui.modal");
    const submitButton = document.querySelector(
      ".ui.modal .send-modal-form-btn"
    );
    const form = document.querySelector(".ui.form");
    if (!submitButton || !form) {
      throw new Error(`Form or submit button not found for ${entityType}`);
    }
    let formIsOK = handleModalCheckForComplete();
    if (!formIsOK) return;
    if (validateFormFunction) formIsOK = validateFormFunction(form);
    if (!formIsOK) return;
    //ACa sigo, pinto loading el boton
    submitButton.classList.add("loading");
    // Armo el bodyData con lo que viene de parametro
    // Construir el bodyData con la función personalizada
    const bodyData = buildBodyData(form);
    if (method == "PUT") {
      if (bodyData instanceof FormData) {
        bodyData.set("id", modal.dataset.db_id); // Si es FormData, usa .set()
      } else {
        bodyData.id = modal.dataset.db_id; // Si es un objeto normal, asigna directamente
      }
    }
    if (entityType == "user") {
      let modalResponse = true; //Esto es para no cerrar el modal si da incorrecto
      //Aca es para los forms de user
      if (postToDatabase) {
        try {
          modalResponse = await postToDatabase(bodyData, method);
        } catch (error) {
          console.error(`Error posting ${entityType} to database`, error);
          submitButton.classList.remove("loading");
          return;
        }
      }
      submitButton.classList.remove("loading");
      // Cierro el modal
      if (modalResponse) handlePageModal(false);
      if (updateElements) {
        //Ahora deberia actualizar dependiendo donde este
        await updateElements();
      }
      return;
    }
    let fetchResponse = true;
    if (userLogged) {
      //Aca esta loggeado, lo creo en db
      bodyData.user_id = userLogged.id;
      if (postToDatabase) {
        try {
          fetchResponse = await postToDatabase(bodyData, method);
        } catch (error) {
          console.error(`Error posting ${entityType} to database`, error);
          submitButton.classList.remove("loading");
          return;
        }
      }
    } else {
      //Aca es un guest, lo creo en session
      // Invitado: guardar en sessionStorage
      saveGuestEntity(bodyData);
    }    
    // Si dio true el fetch, o no habia usuario
    if (fetchResponse) {
      // Cierro el modal
      handlePageModal(false);
      if (updateElements) {
        if (userLogged && (entityType == "address" || entityType == "phone")) {
          //Aca me fijo si marco default y lo hago "Manual"
          if (bodyData.defaultAddress) {
            //ACa se que activo el default de la direc, cambio el de todos
            userLogged.addresses.forEach(
              (dbAddress) =>
                (dbAddress.default =
                  dbAddress.id == bodyData?.id ? true : false)
            );
            //Esto es porque si es post no llega bodyData.id, entonces deschequea todos
            if (method == "POST")
              userLogged.addresses[
                userLogged.addresses.length - 1
              ].default = true;
          } else if (bodyData.defaultPhone) {
            //aca se que activo el default del phone, hago lo mismo
            userLogged.phones.forEach(
              (dbPhone) =>
                (dbPhone.default = dbPhone.id == bodyData?.id ? true : false)
            );
            //Esto es porque si es post no llega bodyData.id, entonces deschequea todos
            if (method == "POST")
              userLogged.phones[userLogged.phones.length - 1].default = true;
          }
        }
        //Ahora deberia actualizar dependiendo donde este
        await updateElements();
      }
    }
    submitButton.classList.remove("loading");
    return;
  } catch (error) {
    console.log("FALLE");
    return console.log(error);
  }
}

//Arma los body data de las entidades
export function buildPhoneBodyData(form) {
  return {
    country_id: form.phone_country_id?.value,
    phone_number: form.phone_number?.value,
    id: userLogged ? undefined : generateRandomString(10),
    defaultPhone: form["phone_default"]?.checked,
  };
}

export function buildAddressBodyData(form) {
  return {
    label: form["address-label"]?.value,
    street: form["address-street"]?.value,
    detail: form["address-detail"]?.value,
    city: form["address-city"]?.value,
    province: form["address-province"]?.value,
    country_id: form["address-country-id"]?.value,
    zip_code: form["address-zip"]?.value,
    id: userLogged ? undefined : generateRandomString(10),
    defaultAddress: form["address-default"]?.checked,
  };
}
export function buildProductBodyData(form) {
  let bodyDataToReturn = {
    es_name: form["product-es-name"]?.value,
    eng_name: form["product-en-name"]?.value,
    ars_price: form["product-ars-price"]?.value,
    usd_price: form["product-usd-price"]?.value,
    english_description: form["product-en-description"]?.value,
    spanish_description: form["product-es-description"]?.value,
    sku: form["product-sku"]?.value,
    category_id: form["product-category-id"]?.value,
    variations: [],
    images: [],
    filesFromArray: [],
    current_images: [],
  };
  const variationFields = document.querySelectorAll(".variation-field") || [];
  variationFields.forEach((field) => {
    const tacoId = field.querySelector(
      'select[name="variation-taco-id"]'
    ).value;
    const sizeContainers =
      field.querySelectorAll(".variation-size-container") || [];
    sizeContainers.forEach((sizeField) => {
      const sizeId = sizeField.querySelector(
        'select[name="variation-size-id"]'
      ).value;
      const stock = sizeField.querySelector(
        'input[name="variation-stock"]'
      ).value;
      bodyDataToReturn.variations.push({
        taco_id: tacoId,
        size_id: sizeId,
        quantity: stock,
      });
    });
  });
  const imagesInput = form["product-image"];
  if (imagesInput && imagesInput.files?.length > 0) {
    bodyDataToReturn.images = Array.from(imagesInput.files); // Convertir FileList a Array
    // Crear un array con los nombres de los archivos
    bodyDataToReturn.filesFromArray = bodyDataToReturn.images.map((file) => ({
      filename: file.name,
      main_file: file.main_file,
    }));
  }
  //Ahora agrego los filenames que quedaron del producto de antes
  const productOldFiles = document.querySelectorAll(
    ".image-radio-box.product-file"
  );
  productOldFiles?.forEach((prodFile) => {
    const isMainFile = prodFile.querySelector(
      'input[name="mainImage"]'
    ).checked;
    bodyDataToReturn.current_images.push({
      id: prodFile.dataset.db_id,
      filename: prodFile.dataset.filename,
      main_file: isMainFile,
    });
  });
  // Convertir el objeto en FormData
  const formData = new FormData();

  // Agregar campos normales al FormData
  Object.keys(bodyDataToReturn).forEach((key) => {
    if (
      key === "variations" ||
      key === "filesFromArray" ||
      key == "current_images"
    ) {
      // Convertir las variaciones a JSON y agregar al FormData
      formData.append(key, JSON.stringify(bodyDataToReturn[key]));
    } else if (key === "images") {
      // Agregar archivos al FormData
      bodyDataToReturn.images.forEach((file) => {
        formData.append("images", file); // `images` debe coincidir con el nombre esperado en backend
      });
    } else if (bodyDataToReturn[key] !== undefined) {
      formData.append(key, bodyDataToReturn[key]);
    }
  });

  return formData;
}

export function buildUserSignUpBodyData(form) {
  return {
    first_name: form["user-first-name"]?.value,
    last_name: form["user-last-name"]?.value,
    email: form["user-email"]?.value,
    rePassword: form["user-re-password"]?.value,
    password: form["user-password"]?.value,
  };
}
export function buildUserLoginBodyData(form) {
  return {
    email: form["user-email"]?.value,
    password: form["user-password"]?.value,
  };
}

export function toggleInputPasswordType(event) {
  if (!event) return;
  const input = event.target?.closest(".icon.input")?.querySelector("input");
  if (!event.target?.classList?.contains("slash")) {
    //Aca muestro la contrasena
    input.type = "text";
    event.target?.classList.add("slash");
    return;
  }
  //Aca ocultto la contrasena
  input.type = "password";
  event.target?.classList?.remove("slash");
  return;
}

export function getDateString(date) {
  const orderDate = new Date(date); // Asume que tienes la fecha de creación
  const locale = isInSpanish ? "es-ES" : "en-US"; // Seleccionar el idioma basado en isInSpanish
  const options = { day: "numeric", month: "long", year: "numeric" };
  return orderDate.toLocaleDateString(locale, options);
}

//Una vez que se crea la entidad, ahi dependiendo si es en carro o profile tengo que hacer algo
export async function updateAddressElements() {
  try {
    // Obtener el path de la URL actual
    const path = window.location.pathname;
    //Me fijo url y en base a eso veo si estoy en cart o en el perfil del usuario
    // Verificar el final de la URL
    if (path.endsWith("/carro")) {
      // Lógica específica para la página del carrito
      await cartExportObj.paintCheckoutAddressesSelect();
    } else if (path.includes("/perfil")) {
      // Lógica específica para la página del perfil
      await userProfileExportObj.pageConstructor();
    }
  } catch (error) {
    return console.log(error);
  }
}
export async function updatePhoneElements() {
  try {
    // Obtener el path de la URL actual
    const path = window.location.pathname;
    //Me fijo url y en base a eso veo si estoy en cart o en el perfil del usuario
    // Verificar el final de la URL
    if (path.endsWith("/carro")) {
      // Lógica específica para la página del carrito
      await cartExportObj.paintCheckoutPhoneSelect();
    } else if (path.endsWith("/perfil")) {
      // Lógica específica para la página del perfil
      // Lógica específica para la página del perfil
      await userProfileExportObj.pageConstructor();
    }
  } catch (error) {
    return console.log(error);
  }
}
export async function updateProductTable() {
  try {
    userProfileExportObj.pageConstructor();
  } catch (error) {
    return console.log(error);
  }
}

//Crea y actualiza los valores de phone & address del usuario loggeado (se supone que solo creamos phone & address de los usuarios)
export async function handlePhoneFetch(bodyData, method) {
  let response = await fetch("/api/phone", {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  });

  if (response.ok) {
    response = response.ok && (await response.json());
    //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
    if (method == "POST") {
      //Aca agrego
      userLogged.phones?.push(response.phone);
    } else if (method == "PUT") {
      //Aca modifico, tengo que modificar en el array de userlogged
      let phoneToChangeIndex = userLogged.phones?.findIndex(
        (phoneFromDB) => phoneFromDB.id == bodyData.id
      );
      if (phoneToChangeIndex < 0) return;
      bodyData.country = countriesFromDB.find(
        (counFromDB) => counFromDB.id == bodyData.country_id
      ); // Esto es para que me lleve la entidad y poder pintar el nombre del pais
      userLogged.phones[phoneToChangeIndex] = bodyData;
    }
    let responseMsg = isInSpanish ? response.msg.es : response.msg.en;
    showCardMessage(true, responseMsg);
    return true;
  }
  return false;
}
export async function handleAddressFetch(bodyData, method) {
  let response = await fetch("/api/address", {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  });

  if (response.ok) {
    response = response.ok && (await response.json());
    //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
    if (method == "POST") {
      //Aca agrego
      userLogged.addresses?.push(response.address);
    } else if (method == "PUT") {
      //Aca modifico, tengo que modificar en el array de userlogged
      let addressToChangeIndex = userLogged.addresses?.findIndex(
        (addressFromDB) => addressFromDB.id == bodyData.id
      );
      if (addressToChangeIndex < 0) return;
      userLogged.addresses[addressToChangeIndex] = bodyData;
    }
    let responseMsg = isInSpanish ? response.msg.es : response.msg.en;
    showCardMessage(true, responseMsg);
    return true;
  }
  let msg = isInSpanish
    ? "Ha ocurrido un error, intente nuevamente"
    : "There was an error processing your request, please try again";
  showCardMessage(false, msg);
  return false;
}

export async function handleProductFetch(bodyData, method) {
  try {
    let response = await fetch(`/api/product`, {
      method: method,
      body: bodyData,
    });    
    response = await response.json()
    if (response.ok) {
      //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
      if (method == "POST") {
        //Aca agrego
        productsFromDB?.push(response.product);
      } else if (method == "PUT") {
        //Aca modifico, tengo que modificar en el array de userlogged
        let productToChangeIndex = productsFromDB?.findIndex(
          (prodFromDB) => prodFromDB.id == response?.product?.id
        );
        if (productToChangeIndex < 0) return;
        productsFromDB[productToChangeIndex] = response.product;
      }
      let responseMsg = response.msg;
      showCardMessage(true, responseMsg);
      return true;
    }    
    showCardMessage(false, response.msg);
    return false;
  } catch (error) {
    return console.log(error);
  }
}

export async function handleUserLoginFetch(bodyData) {
  let response = await fetch("/api/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  });
  if (response.ok) {
    response = response.ok ? await response.json() : null;
    if (response.ok) {
      //Esta es la respuesta de las credenciales
      //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
      showCardMessage(true, isInSpanish ? response.msg.es : response.msg.en);
      await checkForUserLogged();
      const bodyName = document.querySelector("body").dataset.page_name;
      // Esto es porque si pasa de no estar logeado a estarlo, pinto los productos del carro
      if (bodyName == "cart") await cartExportObj.pageConstructor();
      return true;
    }
    showCardMessage(false, isInSpanish ? response.msg.es : response.msg.en);
    return false;
  }
  let msg = isInSpanish
    ? "Ha ocurrido un error inesperado, intente nuevamente"
    : "There was an unexpected error, please try again";
  showCardMessage(false, msg);
  return false;
}
export async function handleUserSignUpFetch(bodyData) {
  let response = await fetch("/api/user/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  });
  if (response.ok) {
    response = response.ok ? await response.json() : null;
    //Esta es la respuesta de las credenciales
    //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
    showCardMessage(true, isInSpanish ? response.msg.es : response.msg);
    await checkForUserLogged();
    return (window.location.href = "/");
    return;
  }
  let msg = isInSpanish
    ? "Ha ocurrido un error inesperado, intente nuevamente"
    : "There was an unexpected error, please try again";
  showCardMessage(false, msg);
  return false;
}

//Pinta la tarjeta de succes/error
export function showCardMessage(isPositive, messageText) {
  // Seleccionar el contenedor padre
  const messageContainer = document.querySelector(".view-message-container");

  if (!messageContainer) {
    console.error("Contenedor principal no encontrado");
    return;
  }

  // Seleccionar los mensajes positivo y negativo
  const positiveMessage = messageContainer.querySelector(
    ".ui.positive.huge.message"
  );
  const negativeMessage = messageContainer.querySelector(
    ".ui.negative.huge.message"
  );

  if (!positiveMessage || !negativeMessage) {
    console.error("Mensajes positivo o negativo no encontrados");
    return;
  }

  // Ocultar ambos mensajes inicialmente
  positiveMessage.classList.add("hidden");
  negativeMessage.classList.add("hidden");

  // Mostrar el mensaje correspondiente
  const messageToShow = isPositive ? positiveMessage : negativeMessage;
  messageToShow.querySelector(".header").textContent = messageText || "";
  messageToShow.classList.remove("hidden");
  // Volver a ocultarlo después de 2 segundos
  setTimeout(() => {
    messageToShow.classList.add("hidden");
  }, 2000);
}
//Deshabilita un boton por x cantidad de tiempo
export function disableBtn(btn, time) {
  btn.classList.add("disabled");
  setTimeout(() => {
    btn.classList.remove("disabled");
  }, time);
}
export function getProductMainImage(prod) {
  let mainFile;
  const { files } = prod;
  if (files.length > 0) {
    files.forEach((file) => {
      if (file.main_file === 1) {
        mainFile = file;
        return;
      }
    });
  } else {
    mainFile = null;
  }
  return mainFile;
}

export function getProductImageSizeUrl(file, screenWidth) {
  const sizeToFind = screenWidth <= 720 ? "1x" : "2x";
  const url = file.file_urls.find((fileUrl) => fileUrl.size === sizeToFind).url;
  return url;
}

export function scrollToTop() {
  return window.scrollTo(0, 0);
}

export function getEjsElementAndTranslate(classname, language) {
  // recibo la clase del elemento
  // puede ser un titulo, una descripción, cualquier cosa
  // agarro el elemento
  // en base al lenguaje saco el dataset-eng dataset-esp
  // seteo el text content
}
export function handleUserSignUpClick() {
  createUserSignUpModal();
  handlePageModal(true);
  const passwordRequirements = []
  if (isInSpanish){
    passwordRequirements.push('Longitud Minima: 8 Caracteres');
    passwordRequirements.push('Al menos 1 mayuscula');
  }else{
    passwordRequirements.push('Minimum Length: 8 Characters');
    passwordRequirements.push('At least 1 uppercase');
  }
  const passwordTooltip = generateTooltip(passwordRequirements);
  const passwordField = document.querySelector('.ui.modal .password-field label');
  passwordField.appendChild(passwordTooltip);
  // Inicializar el popup de Semantic UI con soporte para HTML
  $('.tooltip-icon').popup({
    popup: $('.tooltip-content'),
    on: 'hover',
    hoverable: true,
    position: 'left center' // Mueve el tooltip a la izquierda
  });
}

//Estas funciones pintan y activan el modal de telefonos/direcciones
export const handleNewPhoneButtonClick = async (phone = undefined) => {
  await createPhoneModal(phone);
  // Abro el modal
  handlePageModal(true);
  // await listenToPhoneCreateBtn()//hago el fetch para crear ese telefono
};
export const handleNewAddressButtonClick = async (address = undefined) => {
  await createAddressModal(address);
  // Abro el modal
  handlePageModal(true);
};

export const handleRemoveAddressButtonClick = async (address) => {
  disableAddressModal(address);
  // Abro el modal
  handlePageModal(true);
  // Agrego la escucha para borrar
  const form = document.querySelector(".ui.modal form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Hago el fetch para borrar
    let response = await fetch(`/api/address/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address_id: address.id }),
    });
    if (response.ok) {
      response = await response.json();
      const addressIndexFromList = userLogged.addresses?.findIndex(
        (add) => add.id == address.id
      );
      if (addressIndexFromList !== -1) {
        userLogged.addresses.splice(addressIndexFromList, 1);
      }
      closeModal();
      showCardMessage(true, isInSpanish ? response.msg.es : response.msg.en);
      return updateAddressElements();
    }
    let msg = isInSpanish ? "Ha ocurrido un error" : "An error has ocurred";
    showCardMessage(false, msg);
  });
};
export const handleRemovePhoneButtonClick = async (phone) => {
  disablePhoneModal(phone);
  // Abro el modal
  handlePageModal(true);
  // Agrego la escucha para borrar
  const form = document.querySelector(".ui.modal form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Hago el fetch para borrar
    let response = await fetch(`/api/phone/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone_id: phone.id }),
    });
    if (response.ok) {
      response = await response.json();
      const phoneIndexFromList = userLogged.phones?.findIndex(
        (dbPhone) => dbPhone.id == phone.id
      );
      if (phoneIndexFromList !== -1) {
        userLogged.phones.splice(phoneIndexFromList, 1);
      }
      closeModal();
      showCardMessage(true, isInSpanish ? response.msg.es : response.msg.en);
      return updatePhoneElements();
    }
    let msg = isInSpanish ? "Ha ocurrido un error" : "An error has ocurred";
    showCardMessage(false, msg);
  });
};
// recibe fecha en 2025-01-29T18:33:30.000Z y la pasa a dia, mes y año
export const sanitizeDate = (date) => {
  const fecha = new Date(date);
  const dia = fecha.getUTCDate().toString().padStart(2, "0");
  const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, "0"); // Sumar 1 porque los meses van de 0 a 11
  const año = fecha.getUTCFullYear();
  return `${dia}-${mes}-${año}`;
};

export const handleUpdateZonePrices = async (pricesObject, zoneId) => {
  const { usdPriceInputValue, arsPriceInputValue } = pricesObject;
  const updateResponse = await fetch(`/api/shipping/zones/${zoneId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usd_price: usdPriceInputValue,
      ars_price: arsPriceInputValue,
    }),
  });
  return updateResponse.ok;
};

//ESTAS 3 FUNCIONES SON PARA ESCUCHAR EN EL MODAL DE PRODUCTO LAS OPCIONES DE LOS SELECTS
export function checkForVariationsSelects() {
  const tacoSelects = document.querySelectorAll(
    'select[name="variation-taco-id"]'
  );

  function updateDisabledOptions() {
    const selectedTacoIDs = Array.from(tacoSelects)
      .map((select) => parseInt(select.value))
      .filter((id) => !isNaN(id));

    tacoSelects.forEach((select) => {
      select.querySelectorAll("option").forEach((option) => {
        const optionValue = parseInt(option.value);
        if (!isNaN(optionValue)) {
          option.disabled =
            selectedTacoIDs.includes(optionValue) &&
            optionValue !== parseInt(select.value);
        }
      });
    });

    checkForSizeSelects(); // Actualizar los sizes dentro de cada taco
  }

  updateDisabledOptions();
}
// Nueva función para manejar la lógica de los sizes dentro de cada taco
export function checkForSizeSelects() {
  const variationFields = document.querySelectorAll(".variation-field");

  variationFields.forEach((field) => {
    const sizeSelects = field.querySelectorAll(
      'select[name="variation-size-id"]'
    );

    function updateSizeOptions() {
      const selectedSizeIDs = Array.from(sizeSelects)
        .map((select) => parseInt(select.value))
        .filter((id) => !isNaN(id));

      sizeSelects.forEach((select) => {
        select.querySelectorAll("option").forEach((option) => {
          const optionValue = parseInt(option.value);
          if (!isNaN(optionValue)) {
            option.disabled =
              selectedSizeIDs.includes(optionValue) &&
              optionValue !== parseInt(select.value);
          }
        });
      });
    }

    updateSizeOptions();
  });
}

export function setupSelectListeners() {
  document.addEventListener("change", (event) => {
    if (event.target.matches('select[name="variation-taco-id"]')) {
      checkForVariationsSelects(); // Actualizar cuando cambie un taco
    }

    if (event.target.matches('select[name="variation-size-id"]')) {
      checkForSizeSelects(); // Actualizar cuando cambie un size
    }
  });
}

//Retorna la menor cantidad de decimales
export function minDecimalPlaces(number) {
  // Convert the number to a string
  const numberString = number.toString();

  // Check if the number has decimals
  if (numberString.includes(".")) {
    // Remove unnecessary zeros at the end of the decimal part
    const decimalsWithoutZeros = numberString.replace(/\.?0+$/, "");
    // If there are no decimals left, remove the decimal point
    return decimalsWithoutZeros.replace(/\.$/, "");
  } else {
    // If the number has no decimals, simply return the number as it is
    return numberString;
  }
}

export function displayBigNumbers(nmbr) {
  return parseFloat(nmbr).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getLastParamFromURL() {
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split("/");
  return pathSegments[pathSegments.length - 1];
}

export function handleInputFileFromModal({ show }) {
  const containerToShow = document.querySelector(
    ".ui.modal .input-file-container"
  );
  if (show) return containerToShow.classList.remove("hidden");
  return containerToShow.classList.add("hidden");
}

export function getDeepCopy(arg) {
  return JSON.parse(JSON.stringify(arg));
}

export function removeIndexesFromArray(arr, indexesToRemove) {
  return arr.filter((_, index) => !indexesToRemove.includes(index));
}
export function copyToClipboard(container) {
  container.select();
  document.execCommand("copy");
  container.blur();
}
export function copyElementValue(value) {
  const textareaToCopyMails = document.createElement("textarea");
  textareaToCopyMails.innerHTML = value;
  document.body.appendChild(textareaToCopyMails);
  copyToClipboard(textareaToCopyMails);
  textareaToCopyMails.remove();
}
export function activateCopyMsg(){
  const copyPDiv = document.querySelector(".copy_p_msg.ui.message");
  copyPDiv.innerHTML = isInSpanish ? '¡Copiado!' : 'Copied!'
  copyPDiv?.classList.add("copy_p_msg_active");
      setTimeout(() => {
        copyPDiv?.classList.remove("copy_p_msg_active");
        
      }, 1000);
};

export function isOnPage(path) {
  const currentPath = window.location.pathname.replace(/\/$/, ""); // Elimina la barra final
  // Si path es vacío o "index", considerar como "/"
  if (path === "") {
    return currentPath === "" || currentPath === "/";
  }

  return currentPath.endsWith(path);
}


export async function scriptInitiator(){
  try {
    await checkForUserLogged();
    decideLanguageInsertion();
    headerExportObject.headerScriptInitiator();
    let payingOrder = handleOrderInLocalStorage({type: 2});
    if(payingOrder && !isOnPage('post-compra')){
      //Aca tengo que dar de baja la orden
      let response = await fetch(`/api/order/paymentFailed/${payingOrder}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if(response.ok){
        response = await response.json();
        //Ahora si se cancelo de db entonces lo elimino
        if(response.orderWasCanceled)handleOrderInLocalStorage({type: 3});
      }
      
    }
  } catch (error) {
    return console.log(error);
    
  }
};

function activatePopups() {
  $(".ui.icon.button").popup();
}

export function handleOrderInLocalStorage({type, orderID = undefined}){
  //Types: 1: setear con orderID || 2: Chequear || 3: Borrar
  //Entra al localstorage isPaying y se fija si hay.
  type = parseInt(type);
  let returnVar = true;
  // Si llega a haber, entonces damos de baja la orden
  switch (type) {
    case 1:
      setLocalStorageItem('payingOrderID',orderID)
      break;
  
    case 2:
      returnVar = getLocalStorageItem('payingOrderID');
      break;
  
    case 3:
      deleteLocalStorageItem('payingOrderID');
      break;
  
    default:
      break;
  };
  return returnVar
}