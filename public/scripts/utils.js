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

export async function setProductsFromDB(){
    try {
        let array = (
          await (await fetch(`${window.location.origin}/api/product/`)).json()
        ).data || [];
        productsFromDB = array;
      } catch (error) {
        return console.log(`Falle en setProductsFromDB: ${error}`);
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

export function createModal({ headerTitle, formFields, submitButtonText }) {
  // Eliminar cualquier modal existente antes de crear uno nuevo
  const existingModal = document.querySelector(".ui.small.modal");
  if (existingModal) {
    existingModal.remove();
  }
  // Crear el contenedor del modal
  const modal = document.createElement("div");
  modal.className = "ui small modal";

  // Crear el header del modal
  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `${headerTitle} <i class='bx bx-x close_modal_btn mobile-only'></i>`;
  modal.appendChild(header);

  // Crear el contenedor de contenido
  const content = document.createElement("div");
  content.className = "content";

  // Crear el formulario
  const form = document.createElement("form");
  form.className = "ui form";

  // Recorrer los campos y añadirlos al formulario
  formFields.forEach((field) => {
      let fieldContainer;

      // Si es un contenedor "two fields"
      if (field.type === "two-fields") {
          fieldContainer = document.createElement("div");
          fieldContainer.className = "two fields";

          field.fields.forEach((subField) => {
              const subFieldContainer = document.createElement("div");
              subFieldContainer.className = `field ${subField.required ? "required" : ""}`;

              if (subField.label) {
                  const label = document.createElement("label");
                  label.textContent = subField.label;
                  subFieldContainer.appendChild(label);
              }

              if (subField.type === "select") {
                  const select = document.createElement("select");
                  select.name = subField.name || "";
                  select.className = subField.className || "ui dropdown";
                  select.required = subField.required || false;

                  if (Array.isArray(subField.options)) {
                      subField.options.forEach((option) => {
                          const optionElement = document.createElement("option");
                          optionElement.value = option.value || "";
                          optionElement.textContent = option.label || "";
                          if (option.selected) optionElement.selected = true;
                          select.appendChild(optionElement);
                      });
                  }

                  subFieldContainer.appendChild(select);
              } else {
                  const input = document.createElement("input");
                  input.type = subField.type || "text";
                  input.name = subField.name || "";
                  input.placeholder = subField.placeHolder || "";
                  input.required = subField.required || false;
                  input.className = subField.className || "";
                  subFieldContainer.appendChild(input);
              }

              fieldContainer.appendChild(subFieldContainer);
          });
      } else {
          // Para campos individuales
          fieldContainer = document.createElement("div");
          fieldContainer.className = `field ${field.required ? "required" : ""}`;

          if (field.label) {
              const label = document.createElement("label");
              label.textContent = field.label;
              fieldContainer.appendChild(label);
          }

          if (field.type === "select") {
              const select = document.createElement("select");
              select.name = field.name || "";
              select.className = field.className || "ui dropdown";
              select.required = field.required || false;

              if (Array.isArray(field.options)) {
                  field.options.forEach((option) => {
                      const optionElement = document.createElement("option");
                      optionElement.value = option.value || "";
                      optionElement.textContent = option.label || "";
                      if (option.selected) optionElement.selected = true;
                      select.appendChild(optionElement);
                  });
              }

              fieldContainer.appendChild(select);
          } else {
              const input = document.createElement("input");
              input.type = field.type || "text";
              input.name = field.name || "";
              input.placeholder = field.placeHolder || "";
              input.required = field.required || false;
              input.className = field.className || "";
              fieldContainer.appendChild(input);
          }
      }

      form.appendChild(fieldContainer);
  });

  // Agregar botón de envío
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "ui right floated button submit basic negative";
  submitButton.textContent = submitButtonText || "Submit";
  form.appendChild(submitButton);
  const divFieldToAppend = document.createElement("div");
  divFieldToAppend.className = "field";
  form.appendChild(divFieldToAppend);
  // Agregar mensaje de error
  const errorMessage = document.createElement("div");
  errorMessage.className = "ui error message";
  form.appendChild(errorMessage);

  // Agregar el formulario al contenido
  content.appendChild(form);

  // Agregar el contenido al modal
  modal.appendChild(content);

  // Insertar el modal en el DOM
  document.body.appendChild(modal);

  return modal;
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
