import { countriesFromDB, setCountries } from "./getStaticTypesFromDB.js";
import { settedLanguage } from "./languageHandler.js";
import { activateDropdown, createModal, generateRandomString } from "./utils.js";

export function checkoutCard (props) {
    const productMainFile = props.files?.find(file=>file.main_file)
    props.quantity = props.quantity || 1; //TODO: cambiar por lo que trae el carro
    const container = document.createElement("div");
    container.className = "card checkout-card";
    container.dataset.price = props.ars_price; //TODO: IDIOMA
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
    header.textContent = props.es_name; //TODO: IDIOMA
  
    // Meta
    const metaDiv = document.createElement("div");
    metaDiv.className = "meta";
    const categorySpan = document.createElement("span");
    categorySpan.className = "card_desc";
    categorySpan.textContent = props.category?.name;
    metaDiv.appendChild(categorySpan);
  
    // Price
    const priceSpan = document.createElement("span");
    priceSpan.className = "card_price";
    priceSpan.textContent = `$${parseInt(props.quantity)*parseFloat(props.ars_price)}`;
  
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
   let isInSpanish =  settedLanguage == 'esp'
  try {
    createModal({
      headerTitle: "Create Phone",
      formFields: [
        {
            type: "two-fields",
            fields: [
                {
                    label: "Phone Area",
                    type: "select",
                    name: "phone_country_id",
                    className:
                      "ui search dropdown country_code_search_input form_search_dropdown",
                    required: true,
                  },
                  {
                    label: "Phone Number",
                    type: "text",
                    className: "numeric-only-input",
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
    activateDropdown(classNameToActivate, arrayToActivateInDropdown, "Select Country Code");
    
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
};

export async function createAddressModal() {
  try {
    createModal({
      headerTitle: "Create Address",
      formFields: [
        {
            label: "Label",
            type: "text",
            name: "address-label",
            className:"",
            required: true,
            placeHolder: "Enter a label (e.g., Home)"
        },
        {
            label: "Street",
            type: "text",
            name: "address-street",
            className:"",
            required: true,
            placeHolder: "Enter the street name"
        },
        {
            label: "Detail",
            type: "text",
            name: "address-detail",
            className:"",
            required: false,
            placeHolder: "Additional details (e.g., Apt, Floor)"
        },
        {
            label: "ZIP",
            type: "text",
            name: "address_zip",
            className:"short-input",
            required: true,
            placeHolder: "Enter the ZIP code"
        },
        {
            label: "City",
            type: "text",
            name: "address-city",
            className:"",
            required: true,
            placeHolder: "Enter the city"
        },
        {
            label: "Province",
            type: "text",
            name: "address-province",
            className:"",
            required: true,
            placeHolder: "Enter the province"
        },
        {
            label: "Country",
            type: "select",
            name: "phone_country_id",
            className:
              "ui search dropdown country_search_input form_search_dropdown",
            required: true,
            placeHolder: "Select a country"
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
};

export async function createUserLoginModal(){
  let isInSpanish =  settedLanguage == 'esp'
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