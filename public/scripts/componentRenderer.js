import { countriesFromDB, setCountries } from "./getStaticTypesFromDB.js";
import { isInSpanish, settedLanguage } from "./languageHandler.js";
import { activateDropdown, generateRandomString } from "./utils.js";

export function checkoutCard (props) {
    const productMainFile = props.files?.find(file=>file.main_file)
    props.quantity = props.quantity || 1; //TODO: cambiar por lo que trae el carro
    const container = document.createElement("div");
    container.className = "card checkout-card";
    const productPrice = isInSpanish ? props.ars_price : props.usd_price;
    container.dataset.price =  productPrice
    // Image section
    const imageDiv = document.createElement("div");
    imageDiv.className = "card_image";

    const img = document.createElement("img");

    // Configurar el srcset y src del elemento img usando productMainFile
    if (productMainFile?.file_urls?.length) {
        const fileUrls = productMainFile.file_urls.map(url => `${url.url} ${url.size}`).join(", ");
        img.srcset = fileUrls;
        img.src = productMainFile.file_urls[productMainFile.file_urls.length - 1].url;
        img.alt = productMainFile.filename; // Usar el nombre del archivo para alt
        // img.dataset.file_id = productMainFile.id; // Agregar un data attribute
        img.loading = "lazy"; // Cargar la imagen de manera perezosa
    } else {
        img.src = '/img/product/default.png';
        let randomNumber = generateRandomString(10)
        img.alt = `default-image-${randomNumber}`; // Usar el nombre del archivo para alt
    }

    imageDiv.appendChild(img);
  
    // Content section
    const contentDiv = document.createElement("div");
    contentDiv.className = "card_content";
  
    // Header
    const header = document.createElement("a");
    header.className = "card-header";
    header.href = `/product/${props.id}`; // Puedes parametrizar este enlace si es necesario
    header.textContent = isInSpanish ? props.es_name : props.eng_name;
  
    // Meta
    const metaDiv = document.createElement("div");
    metaDiv.className = "meta";
    const categorySpan = document.createElement("span");
    categorySpan.className = "card_desc";
    categorySpan.textContent = isInSpanish ? props.category?.name.es : props.category?.name.en;
    metaDiv.appendChild(categorySpan);
  
    // Price
    const priceSpan = document.createElement("span");
    priceSpan.className = "card_price";
    priceSpan.textContent = `$${parseInt(props.quantity)*parseFloat(productPrice)}`;
  
    // Amount container
    const amountContainer = document.createElement("div");
    amountContainer.className = "card_amount_container";
  
    const trashIcon = document.createElement("i");
    trashIcon.className = `trash alternate outline icon remove_card_btn ${props.quantity <= 1 ? '':'hidden'}`;
  
    const quantitySpan = document.createElement("span");
    quantitySpan.className = "card_product_amount";
    quantitySpan.textContent = props.quantity;
  
    const addButton = document.createElement("button");
    const removeButton = document.createElement("button");
    removeButton.className = `ui button number_button remove_more_product ${props.quantity > 1 ? '':'hidden'}`;
    addButton.className = "ui button number_button add_more_product";
  
    const plusIcon = document.createElement("i");
    const minusIcon = document.createElement("i");
    plusIcon.className = "plus icon";
    minusIcon.className = "minus icon";
    removeButton.appendChild(minusIcon);
    addButton.appendChild(plusIcon);
  
    // Append children
    amountContainer.appendChild(trashIcon);
    amountContainer.appendChild(removeButton);
    amountContainer.appendChild(quantitySpan);
    amountContainer.appendChild(addButton);
  
    contentDiv.appendChild(header);
    contentDiv.appendChild(metaDiv);
    contentDiv.appendChild(priceSpan);
    contentDiv.appendChild(amountContainer);
  
    // Append all to container
    container.appendChild(imageDiv);
    container.appendChild(contentDiv);
  
    return container;
  }

export function addressCard(props) {
    // Crear el contenedor principal con clases y data-id
    const card = document.createElement('div');
    card.className = 'card address_card';
    card.setAttribute('data-id', props.id);

    // Crear la sección superior de la tarjeta
    const cardTopContent = document.createElement('div');
    cardTopContent.className = 'card_top_content';

    const cardHeader = document.createElement('p');
    cardHeader.className = 'card-header address_name';
    cardHeader.textContent = props.name || 'Casa';

    const defaultAddressMarker = document.createElement('div');
    defaultAddressMarker.className = `default_address_marker ${props.default ? "default_address_marker_active" : ""}`;

    cardTopContent.appendChild(cardHeader);
    cardTopContent.appendChild(defaultAddressMarker);

    // Crear la sección de contenido de la tarjeta
    const cardContent = document.createElement('div');
    cardContent.className = 'card_content';

    const street = document.createElement('p');
    street.className = 'card_text address_street';
    street.textContent = props.street;

    const detail = document.createElement('p');
    detail.className = 'card_text address_detail';
    detail.textContent = props.detail;

    const zip = document.createElement('p');
    zip.className = 'card_text';
    zip.innerHTML = `CP: <span class="address_zip">${props.zip}</span>`;

    const city = document.createElement('p');
    city.className = 'card_text address_city';
    city.textContent = props.city;

    const country = document.createElement('p');
    country.className = 'card_text address_country';
    country.textContent = props.country;

    cardContent.appendChild(street);
    cardContent.appendChild(detail);
    cardContent.appendChild(zip);
    cardContent.appendChild(city);
    cardContent.appendChild(country);

    // Crear la sección inferior de la tarjeta
    const cardBottomContainer = document.createElement('div');
    cardBottomContainer.className = 'card_botton_container';

    const editLink = document.createElement('a');
    editLink.href = '#';
    editLink.className = 'card_link';
    editLink.textContent = 'Editar';

    const deleteLink = document.createElement('a');
    deleteLink.href = '#';
    deleteLink.className = 'card_link';
    deleteLink.textContent = 'Eliminar';

    cardBottomContainer.appendChild(editLink);
    cardBottomContainer.appendChild(deleteLink);

    // Ensamblar la tarjeta
    card.appendChild(cardTopContent);
    card.appendChild(cardContent);
    card.appendChild(cardBottomContainer);

    return card;
}

export function homeLabel(props)  {
  // Crear el contenedor principal
  const accordion = document.createElement('div');
  accordion.className = 'ui styled fluid accordion home_label';

  // Crear el título
  const title = document.createElement('div');
  title.className = 'title';

  const icon = document.createElement('i');
  icon.className = 'dropdown icon';

  const titleText = document.createTextNode(props.name);

  title.appendChild(icon);
  title.appendChild(titleText);

  // Crear el contenido
  const content = document.createElement('div');
  content.className = 'content';

  // Verificar si desc tiene más de un elemento
  if (Array.isArray(props.desc) && props.desc.length > 1) {
      const ul = document.createElement('ul');
      props.desc.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
      });
      const paragraph = document.createElement('p');
      paragraph.appendChild(ul);
      content.appendChild(paragraph);
  } else {
      const paragraph = document.createElement('p');
      paragraph.className = 'transition hidden';
      paragraph.textContent = Array.isArray(props.desc) ? props.desc[0] : props.desc;
      content.appendChild(paragraph);
  }

  // Ensamblar el contenedor
  accordion.appendChild(title);
  accordion.appendChild(content);

  return accordion;
}

export function form (props) {
    
    const { inputProps, formTitleObject, formAction, method } = props;
    const container = document.createElement('div')
    container.className = 'form-container'; //TODO: ver en caso que hayan 2 forms en la misma pagina
  
  
    const h3Element = document.createElement("h3");
    h3Element.className = "title";
    h3Element.textContent = formTitleObject?.title;
    if(formTitleObject?.datasetObject){
      const {dataKey, dataValue} = formTitleObject?.datasetObject;
      h3Element.dataset[dataKey] = dataValue;
    }
    container.appendChild(h3Element);

    const form = document.createElement("form");
    form.action = formAction;
    form.method = method || 'POST';
    form.className = "custom-form";
    container.appendChild(form);

    inputProps.forEach((input) => {
      const inputContainer = document.createElement("div");
      inputContainer.className = `input-container ${input.contClassNames}`;
      inputContainer.style.width = `${input.width}%`;
  
      let inputElement;
  
      if (input.type === 'select') {
          // Crear un elemento select
          inputElement = document.createElement("select");
          inputElement.name = input.name || "";
          inputElement.required = input.required || false;
          inputElement.className = `form-select ${input.inpClassNames || ""}`;
          if (input.id) inputElement.id = input.id;
  
          // Agregar opciones al select
          (input.options || []).forEach(option => {
              const optionElement = document.createElement("option");
              optionElement.value = option.value || "";
              optionElement.textContent = option.label || "";
              inputElement.appendChild(optionElement);
          });
      } else {
          let randomString = generateRandomString(5); //Esto es para que targetee bien
          // Crear un elemento input (por defecto)
          inputElement = document.createElement("input");
          inputElement.type = input.type || "text";
          inputElement.placeholder = input.placeholder || "";
          inputElement.value = input.value || "";
          inputElement.id = input.id || randomString;
          inputElement.name = input.name || "";
          inputElement.required = input.required || false;
          inputElement.className = `form-input ${input.className || ""}`;
      }
      let label = undefined;
      if (input.label) {
        label = document.createElement("label");
        label.textContent = input.label;
        label.htmlFor = inputElement.id || "";
      }
      if(inputElement.type == 'checkbox'){
        //Los agrego al reves y agrego la clase checkbox-container
        inputContainer.classList.add('checkbox-container')
        inputContainer.appendChild(inputElement);
        label && inputContainer.appendChild(label)
      } else if (input.type === 'switchCheckbox') {
        inputElement.type = 'checkbox'
        // Manejo de switchCheckbox
        const toggleContainer = document.createElement("div");
        toggleContainer.className = "ui toggle checkbox";
        inputElement.classList.add("hidden");
        inputElement.tabIndex = 0;

        toggleContainer.appendChild(inputElement);
        label && toggleContainer.appendChild(label);

        inputContainer.appendChild(toggleContainer);
      } else{
        label && inputContainer.appendChild(label)
        inputContainer.appendChild(inputElement);
      }
      
      form.appendChild(inputContainer);
      });
      return container
}

export function button(props) {
    const button = document.createElement("button");
    button.className = 'ui button custom-btn'
    button.textContent = props.text || 'Submit';

    button.style.width = `${props.width}%`;
    button.style.backgroundColor = props.backgroundColor || '#bf0c12';
    button.style.color = props.fontColor || 'white';
    button.style.fontSize = `${props.fontSize}%`;
    button.style.marginTop = props.marginTop ? `${props.marginTop}%` : '3%';
    button.style.marginBottom = props.marginBottom ? `${props.marginBottom}%` : '3%';

    if (typeof props.onClick === 'function') {
      button.onclick = props.onClick;
    }

    if(props.datasetObject){
      const {dataKey, dataValue} = props.datasetObject;
      button.dataset[dataKey] = dataValue;
    }

    return button;
}

export function productCard (prod, infoFontSize) {
  const {name, filename, price, id} = prod;
  const container = document.querySelector('.products-container');

  const card = document.createElement('div');
  card.className = 'product-card';
  container.appendChild(card)

  const cardAnchor = document.createElement('a');
  cardAnchor.className = 'product-card-anchor';
  cardAnchor.href = `products/${id}`;
  card.appendChild(cardAnchor);

  const imgContainer = document.createElement('div');
  imgContainer.className = 'prod-img-container';
  cardAnchor.appendChild(imgContainer);

  const img = document.createElement('img');
  img.className = 'prod-img';
  img.src = `/img/product/${filename}`;
  imgContainer.appendChild(img);

  const productInfoContainer = document.createElement('div');
  productInfoContainer.className = 'product-info-container';
  cardAnchor.appendChild(productInfoContainer);
  
  const productName = document.createElement('span');
  productName.textContent = name;
  productName.style.fontSize = infoFontSize ? `${infoFontSize}%` : '120%'

  const productPrice = document.createElement('span');
  productPrice.textContent = `$${price}`;
  productPrice.style.fontSize = infoFontSize ? `${infoFontSize}%` : '120%'

  productInfoContainer.appendChild(productName);
  productInfoContainer.appendChild(productPrice);
}

export async function createPhoneModal() {
  try {
    createModal({
      headerTitle: isInSpanish ? "Agregar Telefono" : "Add Phone",
      formFields: [
        {
            type: "two-fields",
            fields: [
                {
                    label: isInSpanish ? "Codigo de area":"Phone Area",
                    type: "select",
                    name: "phone_country_id",
                    className:
                      "ui search dropdown country_code_search_input form_search_dropdown",
                    required: true,
                  },
                  {
                    label: isInSpanish ? "Numero de telefono": "Phone Number",
                    type: "text",
                    className: "numeric-only-input",
                    name: "phone_number",
                    required: true,
                  },
            ]
        }
        
      ],
      submitButtonText: "Create",
    });
    //Una vez creado el modal, activo con los paises
    if (!countriesFromDB.length) {
      await setCountries();
    }
    let classNameToActivate = '.ui.search.dropdown.country_code_search_input.form_search_dropdown'
    let arrayToActivateInDropdown = countriesFromDB?.filter(count=>count.code)?.map(country=>({
        id: country.id,
        name: `+${country.code} (${country.name})`,
    }))
    
    // Ahora activo el select
    activateDropdown(classNameToActivate, arrayToActivateInDropdown, isInSpanish ? "Codigo de area": "Country Code");
    
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
};

export async function createAddressModal() {
  try {
    createModal({
      headerTitle: isInSpanish ? "Agregar Direccion" : "Add Address",
      formFields: [
        {
            label: isInSpanish ? "Etiqueta" : "Label",
            type: "text",
            name: "address-label",
            className:"",
            required: true,
            placeHolder: isInSpanish ? "Etiqueta (ej: Casa)" : "Enter a label (e.g., Home)"
        },
        {
            label: isInSpanish ? "Direccion" :"Street",
            type: "text",
            name: "address-street",
            className:"",
            required: true,
            placeHolder: isInSpanish ? "Direccion completa" : "Enter full street name"
        },
        {
            label: isInSpanish ? "Detalle" : "Detail",
            type: "text",
            name: "address-detail",
            className:"",
            required: false,
            placeHolder: isInSpanish ? "Detalle (ej: 2b, apt 300)" : "Additional details (e.g., Apt, Floor)"
        },
        {
            label: isInSpanish ? "Codigo Postal" : "ZIP",
            type: "text",
            name: "address_zip",
            className:"short-input",
            required: true,
            placeHolder: isInSpanish ? "Codigo postal" :"ZIP code"
        },
        {
            label: isInSpanish ? "Ciudad" :"City",
            type: "text",
            name: "address-city",
            className:"",
            required: true,
            placeHolder: isInSpanish ? "Ciudad" :"Enter the city"
        },
        {
            label: isInSpanish ? "Provincia" :"Province",
            type: "text",
            name: "address-province",
            className:"",
            required: true,
            placeHolder: isInSpanish ? "Provincia" :"Enter the province"
        },
        {
            label: isInSpanish ? "Pais" :"Country",
            type: "select",
            name: "phone_country_id",
            className:
              "ui search dropdown country_search_input form_search_dropdown",
            required: true,
            placeHolder: isInSpanish ? "Elegi un pais" : "Select a country"
          },
      ],
      submitButtonText: "Create",
    });
    //Una vez creado el modal, activo con los paises
    if (!countriesFromDB.length) {
      await setCountries();
    }
    //Aca los paises van solo nombre
    let arrayToActivateInDropdown = countriesFromDB.map(country=>({
        id: country.id,
        name: country.name,
    }))
    let classToActivate = '.ui.search.dropdown.country_search_input.form_search_dropdown'
    // Ahora activo el select
    activateDropdown(classToActivate,arrayToActivateInDropdown, isInSpanish ? "Elegi un pais" : "Select Country");
    
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
};

export async function createUserLoginModal(){
  try {
    createModal({
      headerTitle: isInSpanish ? "Iniciar Sesion" : 'Login',
      formFields: [
        {
            label: "Email",
            type: "text",
            name: "user-email",
            className:"",
            required: true,
            placeHolder: "Email",
        },
        {
            label: isInSpanish ? "Contraseña" : "Password",
            type: "password",
            name: "user-password",
            className:"",
            required: true,
            placeHolder: isInSpanish ? "Contraseña" : "Password",
        },
      ],
      submitButtonText: "Create",
    });
    //Una vez creado el modal, activo con los paises
    if (!countriesFromDB.length) {
      await setCountries();
    }
    //Aca los paises van solo nombre
    let arrayToActivateInDropdown = countriesFromDB.map(country=>({
        id: country.id,
        name: country.name,
    }))
    let classToActivate = '.ui.search.dropdown.country_search_input.form_search_dropdown'
    // Ahora activo el select
    activateDropdown(classToActivate,arrayToActivateInDropdown, "Select Country");
    
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
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
  submitButton.type = "button";
  submitButton.className = "ui right floated button submit basic negative send-modal-form-btn";
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
  
  // Antes del return esucho los botones
  modal.querySelector('.close_modal_btn')?.addEventListener('click',()=>{
    $(modal).modal("hide")
  })
  return modal;
}