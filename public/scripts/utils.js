import { cartExportObj } from "./cart.js";
import { userLogged } from "./checkForUserLogged.js";
import { countriesFromDB } from "./getStaticTypesFromDB.js";
import { isInSpanish } from "./languageHandler.js";

export function activateAccordions() {
    $('.ui.accordion').accordion(); // Activa los acordeones
}
// Logica para que todos los inputs numericos no acepten letras
export function checkForNumericInputs() {
  let numericInputs = document.querySelectorAll(".numeric-only-input");
  numericInputs.forEach((input) => {
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
    const overlay = document.querySelector('.overlay');
    overlay.classList.toggle('overlay-active')
}

export const toggleBodyScrollableBehavior = () => {
    const body = document.querySelector('body');
    body.classList.toggle('non-scrollable');
}
export function generateRandomString(length){
    return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

export let productsFromDB = [];

export async function setProductsFromDB(categoryId, limit, offset) {
  try {
      const queryParams = new URLSearchParams();

      if (categoryId) queryParams.append('categoryId', categoryId);
      if (limit) queryParams.append('limit', limit);
      if (offset) queryParams.append('offset', offset);
      const url = `${window.location.origin}/api/product?${queryParams.toString()}`;    
      let array = (
        await (await fetch(url)).json()
      ).data || [];

      productsFromDB = array;
  } catch (error) {
      console.log(`Falle en setProductsFromDB: ${error}`);
  }
}

export let productFromDB = null;
export async function setProductFromDB(id) {
  try {
      const url = `${window.location.origin}/api/product?productId=${id}`;    
      let array = (
        await (await fetch(url)).json()
      ).data || [];
      if(!array.length)return null
      productFromDB = array[0];
  } catch (error) {
      console.log(`Falle en setProductsFromDB: ${error}`);
  }
}
//busca y pinta el primer loader de un contenedor
export function activateContainerLoader(cont,boolean){
    const loaderToPaint = cont.querySelector('.ui.dimmer')
    console.log(loaderToPaint)
    if(!loaderToPaint)return;
    if(boolean) return loaderToPaint.classList.add('active');
    return loaderToPaint.classList.remove('active')
}

// crea y abre los modals
export function handlePageModal(boolean){
  if(boolean){
  //Abro el popup
  $(".ui.modal").modal({ 
    keyboardShortcuts: false,
    observeChanges: true,
    centered: false
  });
  $(".ui.modal").modal("show");
  document.body.classList.add("scrolling");
  return
  }
  // Aca lo cierro
  $(".ui.modal").modal("hide");
  return;
}

export function activateDropdown(className, array, placeHolder){
  $(className)?.each(function () {
    let search = $(this);
    if (!search?.find("option")?.length && countriesFromDB?.length) {
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
      elem.dropdown({
        fullTextSearch: "exact",
        clearable: true,
        forceSelection: false,
      });
    }
  });
}


// Se fija si esta en desktop
export function isInDesktop() {
  return window.innerWidth >= 1024; // Mobile & Tablet
}

// Se fija que el modal este completo
export function handleModalCheckForComplete(){
  const submitButton = document.querySelector('.ui.modal .send-modal-form-btn');
  const errorsContainer = document.querySelector('.ui.error.message');
  const modalForm = document.querySelector('.ui.form');
  modalForm.classList.remove('error'); // le saco el error
  submitButton.classList.add('basic'); //Lo dejo basic antes
  let formIsComplete = checkForAllModalRequiredFields();
  if(!formIsComplete){
    submitButton.classList.remove('basic'); //Lo dejo full rojo
    modalForm.classList.add('error'); //Le agrego el rojo
    errorsContainer.innerHTML = `<p>${isInSpanish ? 'Debes completar todos los campos requeridos' : 'You have to complete all required fields'}</p>`;
    return false;
  };
  return true;
}

function checkForAllModalRequiredFields(){
  const modalRequiredFields = document.querySelectorAll('.ui.modal input[required], .ui.modal select[required], .ui.modal textarea[required]');
  let flag = true;
  modalRequiredFields.forEach(element => {
    if(!element.value)flag = false;
  });
  return flag;
};

//TODO: ELiminar
export function saveToSessionStorage (dataToSave, keyName, isArray) {
  if(!isArray){
    //Si no es array simplemente lo guardo
    return sessionStorage.setItem(keyName, JSON.stringify(dataToSave));
  }; 

  //Aca quiere agregarlo en forma de array
  const existingData = sessionStorage.getItem(keyName)
  ? JSON.parse(sessionStorage.getItem(keyName))
  : [];
  // Agregar el nuevo objeto al array
  existingData.push(dataToSave);
  // Guardar el array actualizado en sessionStorage
  sessionStorage.setItem(keyName, JSON.stringify(existingData));
  return
};

export function getFromSessionStorage (keyName) {
  return JSON.parse(sessionStorage.getItem(keyName));
};

//Esto maneja todos los post que se hacen en un modal, para ver los parametros en cart.js se invoca
export async function handleModalCreation({entityType, buildBodyData, saveGuestEntity, updateElements, postToDatabase }){
  try {
   const submitButton = document.querySelector('.ui.modal .send-modal-form-btn');
   const form = document.querySelector('.ui.form');
   if (!submitButton || !form) {
    throw new Error(`Form or submit button not found for ${entityType}`);
  }
   submitButton.addEventListener('click',async ()=>{
     let formIsOK = handleModalCheckForComplete();
     if(!formIsOK)return;
     //ACa sigo, pinto loading el boton
     submitButton.classList.add('loading');
    // Armo el bodyData con lo que viene de parametro
    // Construir el bodyData con la función personalizada
    const bodyData = buildBodyData(form);
     if(userLogged){//Aca esta loggeado, lo creo en db
       bodyData.user_id = userLogged.id;
       if (postToDatabase) {
        try {
          await postToDatabase(bodyData);
        } catch (error) {
          console.error(`Error posting ${entityType} to database`, error);
          submitButton.classList.remove('loading');
          return;
        }
      }
     } else {
       //Aca es un guest, lo creo en session
       // Invitado: guardar en sessionStorage
      saveGuestEntity(bodyData);
     };
     // Cierro el modal
     handlePageModal(false);
     if(updateElements){
      //Ahora deberia actualizar dependiendo donde este
      await updateElements();
     }
     
     return;
   });
  } catch (error) {
   console.log("FALLE");
   return console.log(error);
  }
 };

//Arma los body data de las entidades
export function buildPhoneBodyData(form){
  return {
    country_id: form.phone_country_id?.value,
    phone_number: form.phone_number?.value,
    id: userLogged ? undefined : generateRandomString(10),
  }
};

export function buildAddressBodyData(form){
  return {
    label: form['address-label']?.value,
    street: form['address-street']?.value,
    detail: form['address-detail']?.value,
    city: form['address-city']?.value,
    province: form['address-province']?.value,
    country_id: form['address-country-id']?.value,
    zip_code: form['address-zip']?.value,
    id: userLogged ? undefined : generateRandomString(10),
  }
}

//Una vez que se crea la entidad, ahi dependiendo si es en carro o profile tengo que hacer algo
export async function updateAddressElements(){
  try {
      // Obtener el path de la URL actual
      const path = window.location.pathname;
      //Me fijo url y en base a eso veo si estoy en cart o en el perfil del usuario
      // Verificar el final de la URL
      if (path.endsWith('/cart')) {
          // Lógica específica para la página del carrito
          await cartExportObj.paintCheckoutAddressesSelect();
      } else if (path.endsWith('/profile')) {
          // Lógica específica para la página del perfil
          // TODO: UpdatePhoneCards
      }
  } catch (error) {
    return console.log(error);
  }
};
export async function updatePhoneElements(){
  try {
    // Obtener el path de la URL actual
  const path = window.location.pathname;
  //Me fijo url y en base a eso veo si estoy en cart o en el perfil del usuario
  // Verificar el final de la URL
  if (path.endsWith('/cart')) {
      // Lógica específica para la página del carrito
      await cartExportObj.paintCheckoutPhoneSelect();
  } else if (path.endsWith('/profile')) {
      // Lógica específica para la página del perfil
      // TODO: UpdatePhoneCards
  }
  } catch (error) {
    return console.log(error);
  }
};

//Crea y actualiza los valores de phone & address del usuario loggeado (se supone que solo creamos phone & address de los usuarios)
export async function handlePhoneCreateFetch(bodyData){
  let response = await fetch('/api/phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });
  
  if(response.ok){
    response = response.ok &&  await response.json();
    //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
    userLogged.phones?.push(response.phone)
  }
};
export async function handleAddressCreateFetch(bodyData){
  let response = await fetch('/api/address', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });
  
  if(response.ok){
    response = response.ok &&  await response.json();
    //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
    userLogged.addresses?.push(response.address);
  }
}

//Pinta la tarjeta de succes/error
export function showCardMessage(isPositive, messageText) {
  // Seleccionar el contenedor padre
  const messageContainer = document.querySelector('.view_message_container');

  if (!messageContainer) {
      console.error("Contenedor principal no encontrado");
      return;
  }

  // Seleccionar los mensajes positivo y negativo
  const positiveMessage = messageContainer.querySelector('.ui.positive.huge.message');
  const negativeMessage = messageContainer.querySelector('.ui.negative.huge.message');

  if (!positiveMessage || !negativeMessage) {
      console.error("Mensajes positivo o negativo no encontrados");
      return;
  }

  // Ocultar ambos mensajes inicialmente
  positiveMessage.classList.add('hidden');
  negativeMessage.classList.add('hidden');

  // Mostrar el mensaje correspondiente
  const messageToShow = isPositive ? positiveMessage : negativeMessage;
  messageToShow.querySelector('.header').textContent = messageText || '';
  messageToShow.classList.remove('hidden');
  // Volver a ocultarlo después de 2 segundos
  setTimeout(() => {
    messageToShow.classList.add('hidden');
}, 2000);
}
//Deshabilita un boton por x cantidad de tiempo
export function disableBtn(btn,time){
  btn.classList.add('disabled');
  setTimeout(() => {
      btn.classList.remove('disabled');
  }, time);
}
export function getProductMainImage(prod){
  let mainFile;
  const {files} = prod;
  if(files.length > 0){
    files.forEach(file =>  {
      if(file.main_file === 1){
        mainFile = file;
        return;
      }
    })
  } else {
    mainFile = null;
  }
  return mainFile;
}

export function getProductImageSizeUrl (file, screenWidth){
  const sizeToFind = screenWidth <= 720 ? '1x' : '2x';
  const url = file.file_urls.find(fileUrl => fileUrl.size === sizeToFind).url;
  return url;
}

export function scrollToTop(){
  return window.scrollTo(0,0);
}