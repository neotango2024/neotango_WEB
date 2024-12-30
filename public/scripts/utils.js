import { countriesFromDB } from "./getStaticTypesFromDB.js";

export function activateAccordions() {
    $('.ui.accordion').accordion(); // Activa los acordeones
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
    errorsContainer.innerHTML = '<p>Debes completar todos los campos requeridos</p>';
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