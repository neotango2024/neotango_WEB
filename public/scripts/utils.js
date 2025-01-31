import { cartExportObj } from "./cart.js";
import { checkForUserLogged, userLogged } from "./checkForUserLogged.js";
import { createAddressModal, createPhoneModal, createUserSignUpModal } from "./componentRenderer.js";
import { countriesFromDB } from "./getStaticTypesFromDB.js";
import { isInSpanish } from "./languageHandler.js";
import { userProfileExportObj } from "./userProfile.js";

export function activateAccordions() {
    $('.ui.accordion').accordion(); // Activa los acordeones
}
export function initiateMenuBtn(){
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
export async function setProductsFromDB({ categoryId = null, limit = null, offset = null, id = null} = {}) {
  try {
      const queryParams = new URLSearchParams();

      if (categoryId) queryParams.append('categoryId', categoryId);
      if (limit) queryParams.append('limit', limit);
      if (offset) queryParams.append('offset', offset);
      // Agregar los valores del array `id` a los parámetros de la query
      if (Array.isArray(id)) {
        id.forEach((value) => queryParams.append('productId', value));
      } else if (id) {
        queryParams.append('productId', id);
      }
      const url = `${window.location.origin}/api/product?${queryParams.toString()}`;    
  
      let array = (
        await (await fetch(url)).json()
      ).data || [];


      productsFromDB = array;
  } catch (error) {
      console.log(`Falle en setProductsFromDB: ${error}`);
  }
}

export let ordersFromDb;
export const setOrdersFromDb = async () => {
    const response = await fetch('/api/order');
    const data = await response.json();
    ordersFromDb = data.orders;
}


export let variationsFromDB = [];
export async function setVariationsFromDB(id) {
  try {
      const queryParams = new URLSearchParams();
      // Agregar los valores del array `id` a los parámetros de la query
      if (Array.isArray(id)) {
        id.forEach((value) => queryParams.append('variationId', value));
      } else if (id) {
        queryParams.append('variationId', id);
      }
      const url = `${window.location.origin}/api/variation?${queryParams.toString()}`;
  
      let array = (
        await (await fetch(url)).json()
      ).data || [];
      variationsFromDB = array;
  } catch (error) {
      console.log(`Falle en setVariationsFromDB: ${error}`);
  }
}
//busca y pinta el primer loader de un contenedor
export function activateContainerLoader(cont,boolean){
    const loaderToPaint = cont.querySelector('.ui.dimmer')
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
  // document.body.classList.add("scrolling");
  return
  }
  // Aca lo cierro
  $(".ui.modal").modal("hide");
  return;
}

export function activateDropdown({className, array, placeHolder,values}){
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
      elem.dropdown("set selected", values).dropdown({
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
    let field = element.closest('.field')
    field.classList.remove('error');
    if(!element.value){
      flag = false;
      field.classList.add('error');
    };
    //De paso le agrego si no tiene el listened un event change para sacarle la clase
    if(!element.dataset.listened){
      element.dataset.listened = true;
      element.addEventListener('input',(e)=>{
        let field = element.closest('.field')
        e.target.value ? field.classList.remove('error') : field.classList.add('error');
      })
    }
  });
  return flag;
};

//Esto maneja todos los post que se hacen en un modal, para ver los parametros en cart.js se invoca
export async function handleModalCreation({entityType, buildBodyData, saveGuestEntity, updateElements, postToDatabase, validateFormFunction, method }){
  try {  
  const modal = document.querySelector('.ui.modal')  
   const submitButton = document.querySelector('.ui.modal .send-modal-form-btn');
   const form = document.querySelector('.ui.form');
   if (!submitButton || !form) {
    throw new Error(`Form or submit button not found for ${entityType}`);
  }
  let formIsOK = handleModalCheckForComplete();
  if(!formIsOK)return;
  if(validateFormFunction) formIsOK = validateFormFunction(form);
  if(!formIsOK)return;
     //ACa sigo, pinto loading el boton
     submitButton.classList.add('loading');
    // Armo el bodyData con lo que viene de parametro
    // Construir el bodyData con la función personalizada
    const bodyData = buildBodyData(form);
    if(method == "PUT"){
      bodyData.id = modal.dataset.db_id;
    }
    if(entityType == 'user'){
      let modalResponse = true; //Esto es para no cerrar el modal si da incorrecto
      //Aca es para los forms de user
      if (postToDatabase) {
        try {
          modalResponse = await postToDatabase(bodyData, method);
        } catch (error) {
          console.error(`Error posting ${entityType} to database`, error);
          submitButton.classList.remove('loading');
          return;
        }
      };
      submitButton.classList.remove('loading');
      // Cierro el modal
      if(modalResponse)handlePageModal(false);
      if(updateElements){
        //Ahora deberia actualizar dependiendo donde este
        await updateElements();
       }
      return
    }
    if(userLogged){//Aca esta loggeado, lo creo en db
       bodyData.user_id = userLogged.id;
       if (postToDatabase) {
        try {
          await postToDatabase(bodyData,method);
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

export function buildUserSignUpBodyData(form){
  return {
      first_name: form['user-first-name']?.value,
      last_name: form['user-last-name']?.value,
      email: form['user-email']?.value,
      rePassword: form['user-re-password']?.value,
      password: form['user-password']?.value,
  }
}
export function buildUserLoginBodyData(form){
  return {
      email: form['user-email']?.value,
      password: form['user-password']?.value,
  }
}

export function toggleInputPasswordType(event){
  if(!event)return
  const input = event.target?.closest('.icon.input')?.querySelector('input');
  if(!event.target?.classList?.contains('slash')){
    //Aca muestro la contrasena
    input.type = 'text';
    event.target?.classList.add('slash');
    return
  };
  //Aca ocultto la contrasena
  input.type = 'password';
  event.target?.classList?.remove('slash');
  return
}



//Una vez que se crea la entidad, ahi dependiendo si es en carro o profile tengo que hacer algo
export async function updateAddressElements(){
  try {
      // Obtener el path de la URL actual
      const path = window.location.pathname;
      //Me fijo url y en base a eso veo si estoy en cart o en el perfil del usuario
      // Verificar el final de la URL
      if (path.endsWith('/carro')) {
          // Lógica específica para la página del carrito
          await cartExportObj.paintCheckoutAddressesSelect();
      } else if (path.includes('/perfil')) {
          // Lógica específica para la página del perfil
          await userProfileExportObj.pageConstructor();
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
  if (path.endsWith('/carro')) {
      // Lógica específica para la página del carrito
      await cartExportObj.paintCheckoutPhoneSelect();
  } else if (path.endsWith('/perfil')) {
      // Lógica específica para la página del perfil
      // Lógica específica para la página del perfil
      await userProfileExportObj.pageConstructor();
  }
  } catch (error) {
    return console.log(error);
  }
};

//Crea y actualiza los valores de phone & address del usuario loggeado (se supone que solo creamos phone & address de los usuarios)
export async function handlePhoneFetch(bodyData, method){
  let response = await fetch('/api/phone', {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });
  
  if(response.ok){
    response = response.ok &&  await response.json();
    //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
    if(method == "POST"){
      //Aca agrego
      userLogged.phones?.push(response.phone)
    } else if(method == "PUT"){
      //Aca modifico, tengo que modificar en el array de userlogged
      let phoneToChangeIndex = userLogged.phones?.findIndex(phoneFromDB => phoneFromDB.id ==  bodyData.id);
      if(phoneToChangeIndex < 0) return;
      bodyData.country = countriesFromDB.find(counFromDB => counFromDB.id == bodyData.country_id);// Esto es para que me lleve la entidad y poder pintar el nombre del pais   
      userLogged.phones[phoneToChangeIndex] = bodyData;
    };
    let responseMsg = isInSpanish ? response.msg.es : response.msg.en
    showCardMessage(true, responseMsg);
    return true
  };
  return false
};
export async function handleAddressFetch(bodyData, method){
  let response = await fetch('/api/address', {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });
  
  if(response.ok){
    response = response.ok &&  await response.json();
    //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
    if(method == "POST"){
      //Aca agrego
      userLogged.addresses?.push(response.address)
    } else if(method == "PUT"){
      //Aca modifico, tengo que modificar en el array de userlogged
      let addressToChangeIndex = userLogged.addresses?.findIndex(addressFromDB => addressFromDB.id ==  bodyData.id);
      if(addressToChangeIndex<0)return       
      userLogged.addresses[addressToChangeIndex] = bodyData;
    };
    let responseMsg = isInSpanish ? response.msg.es : response.msg.en
    showCardMessage(true, responseMsg);
    return true;
  }
  return false
};

export async function handleUserLoginFetch(bodyData){
  let response = await fetch('/api/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });
  console.log(response)
  if(response.ok){
    response = response.ok ?  await response.json() : null;
    
    if(response.ok){
      //Esta es la respuesta de las credenciales
      //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
      showCardMessage(true,isInSpanish ? response.msg.es: response.msg);
      await checkForUserLogged();
      return true;
    }
    showCardMessage(false,isInSpanish ? response.msg.es: response.msg);
    return false
  };
  let msg = isInSpanish ? "Ha ocuriddo un error inesperado, intente nuevamente": "There was an unexpected error, please try again"
  showCardMessage(false,msg);
  return false
}
export async function handleUserSignUpFetch(bodyData){
  let response = await fetch('/api/user/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });
  if(response.ok){
    response = response.ok ?  await response.json() : null;    
      //Esta es la respuesta de las credenciales
      //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
      showCardMessage(true,isInSpanish ? response.msg.es: response.msg);
      await checkForUserLogged();
      return window.location.href = '/'
      return
  };
  let msg = isInSpanish ? "Ha ocuriddo un error inesperado, intente nuevamente": "There was an unexpected error, please try again"
  showCardMessage(false,msg);
  return false
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

export function getEjsElementAndTranslate(classname, language){
  // recibo la clase del elemento
  // puede ser un titulo, una descripción, cualquier cosa
  // agarro el elemento
  // en base al lenguaje saco el dataset-eng dataset-esp
  // seteo el text content
}
export function handleUserSignUpClick(){
  createUserSignUpModal();
  handlePageModal(true)
}


//Estas funciones pintan y activan el modal de telefonos/direcciones
    export const handleNewPhoneButtonClick = async (phone = undefined)=>{
        await createPhoneModal(phone);
        // Abro el modal
        handlePageModal(true);
        // await listenToPhoneCreateBtn()//hago el fetch para crear ese telefono
        
    }
    export const handleNewAddressButtonClick = async (address = undefined)=>{      
        await createAddressModal(address);
        // Abro el modal
        handlePageModal(true);
    }; 

// recibe fecha en 2025-01-29T18:33:30.000Z y la pasa a dia, mes y año
export const sanitizeDate = (date) => {
  const fecha = new Date(date);
  const dia = fecha.getUTCDate().toString().padStart(2, '0');
  const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0'); // Sumar 1 porque los meses van de 0 a 11
  const año = fecha.getUTCFullYear();
  return `${dia}-${mes}-${año}`;
}