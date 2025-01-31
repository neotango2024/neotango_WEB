import { userLogged } from "./checkForUserLogged.js";
import { countriesFromDB, setCountries } from "./getStaticTypesFromDB.js";
import { isInSpanish, settedLanguage } from "./languageHandler.js";
import { handleAddressModalActions, handlePhoneModalActions, handleUserLoginModal, handleUserSignUpModal } from "./modalHandlers.js";
import { activateDropdown, generateRandomString, getProductImageSizeUrl, getProductMainImage, handleNewAddressButtonClick, handleNewPhoneButtonClick, handleUserSignUpClick, toggleInputPasswordType } from "./utils.js";
const SCREEN_WIDTH = window.screen.width;

export function checkoutCard (props) {
    const productFromDB = props
    const productMainFile = productFromDB.files?.find(file=>file.main_file)
    props.quantity = props.quantity || 1;
    const container = document.createElement("div");
    container.className = "card checkout-card";
    container.dataset.variation_id = props.variation_id;
    const productPrice = isInSpanish ? productFromDB.ars_price : productFromDB.usd_price;
    // Image section
    const imageDiv = document.createElement("div");
    imageDiv.className = "card-image";

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
    contentDiv.className = "card-content";
  
    // Header
    const header = document.createElement("a");
    header.className = "card-header";
    header.href = `/producto/${productFromDB.id}`; // Puedes parametrizar este enlace si es necesario
    header.textContent = isInSpanish ? productFromDB.es_name : productFromDB.eng_name;
  
    // Meta
    const metaCategoryDiv = document.createElement("div");
    metaCategoryDiv.className = "meta";
    let categorySpan = document.createElement("span");
    categorySpan.className = "card-desc";
    categorySpan.textContent = isInSpanish ? productFromDB.category?.name.es : productFromDB.category?.name.en;
    metaCategoryDiv.appendChild(categorySpan);

    const metaVariationDiv = document.createElement("div");
    metaVariationDiv.className = "meta";
    categorySpan = document.createElement("span");
    categorySpan.className = "card-desc";
    categorySpan.textContent = `Taco: ${props.tacoFromDB?.name} || ${isInSpanish ? 'Talle:' : `Size:`} ${props.sizeFromDB?.size}`;
    metaVariationDiv.appendChild(categorySpan);
  
    // Price
    const priceSpan = document.createElement("span");
    priceSpan.className = "card-price";
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
    contentDiv.appendChild(metaCategoryDiv);
    contentDiv.appendChild(metaVariationDiv);
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
    card.setAttribute('data-id', props?.id);

    // Si props es undefined, pintar el "+" y texto centrado
    if (!props) {
      card.classList.add('card_empty'); // Agregar clase opcional para estilos específicos

      // Crear el contenido centrado
      const addIcon = document.createElement('div');
      addIcon.className = 'add_icon';
      addIcon.textContent = '+';

      const addText = document.createElement('p');
      addText.className = 'add_text';
      addText.textContent = isInSpanish ? 'Agregar' : 'Add'; // Basado en la variable global

      card.appendChild(addIcon);
      card.appendChild(addText);

      return card; // Retornar la tarjeta con contenido centrado
    }
    // Crear la sección superior de la tarjeta
    const cardTopContent = document.createElement('div');
    cardTopContent.className = 'card-top-content';

    const cardHeader = document.createElement('p');
    cardHeader.className = 'card-header address_name';
    cardHeader.textContent = props.label;

    const defaultAddressMarker = document.createElement('div');
    defaultAddressMarker.className = `default_address_marker ${props.default ? "default_address_marker_active" : ""}`;

    cardTopContent.appendChild(cardHeader);
    cardTopContent.appendChild(defaultAddressMarker);

    // Crear la sección de contenido de la tarjeta
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    const street = document.createElement('p');
    street.className = 'card_text address_street';
    street.textContent = props.street;

    const detail = document.createElement('p');
    detail.className = 'card_text address_detail';
    detail.textContent = props.detail;

    const zip = document.createElement('p');
    zip.className = 'card_text';
    zip.innerHTML = `CP: <span class="address_zip">${props.zip_code}</span>`;

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

    const editLink = document.createElement('p');
    editLink.className = 'card_link edit_address_card_btn';
    editLink.textContent = isInSpanish ? 'Editar' : "Edit";
    editLink.addEventListener('click',async ()=> await handleNewAddressButtonClick(props))

    const deleteLink = document.createElement('p');
    deleteLink.className = 'card_link destroy_address_card_btn';
    deleteLink.textContent = isInSpanish ? 'Eliminar' : "Remove";

    cardBottomContainer.appendChild(editLink);
    cardBottomContainer.appendChild(deleteLink);

    // Ensamblar la tarjeta
    card.appendChild(cardTopContent);
    card.appendChild(cardContent);
    card.appendChild(cardBottomContainer);

    return card;
}

export function phoneCard(props) {
  // Crear el contenedor principal con clases y data-id
  const card = document.createElement('div');
  card.className = 'card phone-card';
  card.setAttribute('data-id', props?.id);

  // Si props es undefined, pintar el "+" y texto centrado
  if (!props) {
      card.classList.add('card_empty'); // Agregar clase opcional para estilos específicos

      // Crear el contenido centrado
      const addIcon = document.createElement('div');
      addIcon.className = 'add_icon';
      addIcon.textContent = '+';

      const addText = document.createElement('p');
      addText.className = 'add_text';
      addText.textContent = isInSpanish ? 'Agregar' : 'Add'; // Basado en la variable global

      card.appendChild(addIcon);
      card.appendChild(addText);

      return card; // Retornar la tarjeta con contenido centrado
  }

  // Crear el marcador de teléfono predeterminado
  const defaultPhoneMarker = document.createElement('div');
  defaultPhoneMarker.className = `default_phone_marker default_marker ${props.default ? "default_phone_marker_active" : ""}`;

  // Crear la sección de contenido de la tarjeta
  const cardContent = document.createElement('div');
  cardContent.className = 'card-content';

  const phoneNumber = document.createElement('p');
  phoneNumber.className = 'card_text phone_number';
  phoneNumber.textContent = `(+${props.country?.code}) ${props.phone_number}`;

  const phoneCountry = document.createElement('p');
  phoneCountry.className = 'card_text phone_country';
  phoneCountry.textContent = props?.country?.name;

  cardContent.appendChild(phoneNumber);
  cardContent.appendChild(phoneCountry);

  // Crear la sección inferior de la tarjeta
  const cardBottomContainer = document.createElement('div');
  cardBottomContainer.className = 'card_botton_container';

  const editLink = document.createElement('p');
  editLink.className = 'card_link edit_phone_card_btn';
  editLink.textContent = isInSpanish ? 'Editar' : 'Edit';
  editLink.addEventListener('click', async () => await handleNewPhoneButtonClick(props));

  const deleteLink = document.createElement('p');
  deleteLink.className = 'card_link destroy_phone_card_btn';
  deleteLink.textContent = isInSpanish ? 'Eliminar' : 'Remove';

  cardBottomContainer.appendChild(editLink);
  cardBottomContainer.appendChild(deleteLink);

  // Ensamblar la tarjeta
  card.appendChild(defaultPhoneMarker);
  card.appendChild(cardContent);
  card.appendChild(cardBottomContainer);

  return card;
}

export function orderCard(order) {
  const container = document.createElement("div");
  container.className = "card order-card";
  container.dataset.db_id = order.id || '';

  // Top content: Fecha y estado de la orden
  const topContentDiv = document.createElement("div");
  topContentDiv.className = "card-top-content";

  const dateParagraph = document.createElement("p");
  dateParagraph.className = "card-date";
  const orderDate = new Date(order.createdAt); // Asume que tienes la fecha de creación
  const locale = isInSpanish ? 'es-ES' : 'en-US'; // Seleccionar el idioma basado en isInSpanish
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  dateParagraph.textContent = orderDate.toLocaleDateString(locale, options);

  const statusParagraph = document.createElement("p");
  statusParagraph.className = `card-status ${order.orderStatus.class}`;
  statusParagraph.textContent = isInSpanish ? order.orderStatus?.status?.es : order.orderStatus?.status?.en; // Función para convertir el ID de estado en texto

  topContentDiv.appendChild(dateParagraph);
  topContentDiv.appendChild(statusParagraph);

  // Items de la orden
  const itemsContainer = document.createElement("div");
  itemsContainer.className = "card-items-container";

  order.orderItems?.forEach((orderItem,i) => {
      const itemContainer = document.createElement("div");
      itemContainer.className = "card-order-item-container";

      // Imagen del producto
      const imageDiv = document.createElement("div");
      imageDiv.className = "card-image";

      const img = document.createElement("img");
      const imgSrc = orderItem.product?.files[0]?.file_urls[0].url
      if (imgSrc) {
          img.src = imgSrc;
          img.alt = orderItem.name || `Producto-${i}`;
          img.loading = "lazy";
      } else {
          img.src = "/img/product/default.png";
          img.alt = "Default product image";
      }
      imageDiv.appendChild(img);

      // Contenido del producto
      const contentDiv = document.createElement("div");
      contentDiv.className = "card-content";

      const header = document.createElement("p");
      header.className = "card-header";
      header.textContent = `${isInSpanish ? orderItem.es_name : orderItem.eng_name || "Producto sin nombre"} (${orderItem.quantity})`;

      const metaCategoryDiv = document.createElement("div");
      metaCategoryDiv.className = "meta";
      const categorySpan = document.createElement("span");
      categorySpan.className = "card-desc";
      const categoryName = isInSpanish ? orderItem?.product?.category?.name?.es : orderItem?.product?.category?.name?.en;
      categorySpan.textContent = categoryName || isInSpanish ? "Zapato de tango" : "Tango Shoe";
      metaCategoryDiv.appendChild(categorySpan);

      const metaVariationDiv = document.createElement("div");
      metaVariationDiv.className = "meta";
      const variationSpan = document.createElement("span");
      variationSpan.className = "card-desc";
      variationSpan.textContent = `Taco: ${orderItem.taco || "N/A"} || Talle: ${orderItem.size || "N/A"}`;
      metaVariationDiv.appendChild(variationSpan);

      const priceSpan = document.createElement("span");
      priceSpan.className = "card-price";
      priceSpan.textContent = `$${(orderItem.quantity * orderItem.price).toFixed(2)}`;

      // Agregar todos los elementos al contenedor de contenido
      contentDiv.appendChild(header);
      contentDiv.appendChild(metaCategoryDiv);
      contentDiv.appendChild(metaVariationDiv);
      contentDiv.appendChild(priceSpan);

      // Agregar imagen y contenido al contenedor del ítem
      itemContainer.appendChild(imageDiv);
      itemContainer.appendChild(contentDiv);

      // Agregar el ítem al contenedor principal de ítems
      itemsContainer.appendChild(itemContainer);
  });

  // Agregar todo al contenedor principal
  container.appendChild(topContentDiv);
  container.appendChild(itemsContainer);

  return container;
}

// Función auxiliar para convertir el ID de estado en texto
function getStatus(statusId) {
  switch (statusId) {
      case 1: return "Pendiente";
      case 2: return "En proceso";
      case 3: return "Enviado";
      case 4: return "Entregado";
      default: return "Desconocido";
  }
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
    
    const { formClasses, inputProps, formTitleObject, formAction, method, buttonProps } = props;
    const container = document.createElement('div')
    container.className = 'form-container';
  
  
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
    form.className = `custom-form ${formClasses}`;
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
              optionElement.selected = option.selected;
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
       // Crear botones
      if (Array.isArray(buttonProps)) {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";

        buttonProps.forEach((button) => {
          const btn = document.createElement("button");
          btn.type = button.type || "button";
          btn.className = `ui button ${button.className || ""}`;
          btn.textContent = button.text || "Button";
          if (button.onClick && typeof button.onClick === "function") {
            btn.addEventListener("click", button.onClick);
          }
          buttonContainer.appendChild(btn);
        });

      form.appendChild(buttonContainer);
  }
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

    const formContainer = document.querySelector(props.container);
    formContainer?.appendChild(button);
    if(props.datasetObject){
      const {dataKey, dataValue} = props.datasetObject;
      button.dataset[dataKey] = dataValue;
    }

    return button;
}

export function productCard (prod, containerClass, infoFontSize, isCarouselCard = false) {
  const { id, es_name, eng_name, ars_price, usd_price } = prod;
  const container = document.querySelector(`.${containerClass}`);

  const card = document.createElement('div');
  card.className = `${isCarouselCard ? 'carousel-card' : 'product-card'}`;
  card.dataset.productId = id;
  container.appendChild(card);

  const cardAnchor = document.createElement('a');
  cardAnchor.className = 'product-card-anchor';
  cardAnchor.href = `/producto/${id}`;
  card.appendChild(cardAnchor);

  const imgContainer = document.createElement('div');
  imgContainer.className = 'prod-img-container';
  cardAnchor.appendChild(imgContainer);

  const mainImage = getProductMainImage(prod);
  const imageUrl = mainImage ? getProductImageSizeUrl(mainImage) : '';
  const img = document.createElement('img');
  img.className = 'prod-img';
  img.src = imageUrl;
  imgContainer.appendChild(img);

  const productInfoContainer = document.createElement('div');
  productInfoContainer.className = 'product-info-container';
  cardAnchor.appendChild(productInfoContainer);

  const productName = document.createElement('span');
  productName.className = 'product-name';
  productName.textContent = settedLanguage === 'esp' ? es_name : eng_name;
  productName.style.fontSize = infoFontSize ? `${infoFontSize}%` : '120%'

  const productPrice = document.createElement('span');
  productPrice.className = 'product-price';
  productPrice.textContent = `$${settedLanguage === 'esp' ? ars_price : usd_price}`;
  productPrice.style.fontSize = infoFontSize ? `${infoFontSize}%` : '120%'

  productInfoContainer.appendChild(productName);
  productInfoContainer.appendChild(productPrice);
}

export function createUserMenuBtn(props) {
  // Obtener la URL actual
  const currentUrl = window.location.pathname;

  // Crear el contenedor principal
  const container = document.createElement('div');
  container.className = 'ui icon top right pointing dropdown user-menu-btn';

  // Agregar el ícono de menú
  const barsIcon = document.createElement('i');
  barsIcon.className = props.items[0].itemLogo;
  container.appendChild(barsIcon);

  // Crear el menú
  const menu = document.createElement('div');
  menu.className = 'menu';

  // Agregar encabezado según el tipo
  const header = document.createElement('div');
  header.className = 'header';
  if(props.type == 2){
    //user
    header.textContent = isInSpanish ? 'Configuracion' : 'Settings';
  } else {
    //admin
    header.textContent = "Dashboard"
  }
  
  menu.appendChild(header);

  // Crear los elementos del menú
  props.items.forEach((item,i) => {
    const itemLink = document.createElement('a');
    itemLink.className = `item`;
    itemLink.dataset.index = i;
    // Agregar clases adicionales si el tipo coincide con la URL actual
    if (props.actualIndexSelected == i) itemLink.classList.add('active','selected');

    // Establecer el logo e ícono
    const icon = document.createElement('i');
    icon.className = item.itemLogo;
    itemLink.appendChild(icon);

    // Agregar el tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = item.itemLabel;
    itemLink.appendChild(tooltip);

    // Agregar el enlace al menú
    menu.appendChild(itemLink);
  });

  // Agregar el enlace de cierre de sesión
  const logoutLink = document.createElement('a');
  logoutLink.href = '/logout';
  logoutLink.className = 'item';

  const logoutIcon = document.createElement('i');
  logoutIcon.className = 'bx bx-door-open';
  logoutLink.appendChild(logoutIcon);

  const logoutTooltip = document.createElement('span');
  logoutTooltip.className = 'tooltip';
  logoutTooltip.textContent = isInSpanish ? 'Cerrar Sesion' : "Logout";
  logoutLink.appendChild(logoutTooltip);

  menu.appendChild(logoutLink);

  // Agregar el menú al contenedor
  container.appendChild(menu);
  
  // Insertar el contenedor en el DOM
  return container
}

export async function createPhoneModal(phone) {
  try {
    let buttonText,headerText;
    if(phone){
      buttonText = isInSpanish ? "Actualizar" : "Update";
      headerText = isInSpanish ? "Actualizar Telefono" : "Update Phone";
    } else {
      buttonText = isInSpanish ? "Crear" : "Create";
      headerText = isInSpanish ? "Agregar Telefono" : "Add Phone";
    }
    createModal({
      headerTitle: headerText,
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
                    value: phone ? phone.country_id : '',
                    required: true,
                  },
                  {
                    label: isInSpanish ? "Numero de telefono": "Phone Number",
                    type: "text",
                    className: "numeric-only-input",
                    name: "phone_number",
                    value: phone ? phone.phone_number : '',
                    required: true,
                  },
            ]
        }
        
      ],
      buttons: [
        {
          text: buttonText,
          className: "ui button submit negative send-modal-form-btn",
          onClick: async() => await handlePhoneModalActions(phone)
        },
      ],
      id: phone ? phone.id : undefined
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
    activateDropdown({
      className: classNameToActivate, 
      array: arrayToActivateInDropdown, 
      placeHolder: isInSpanish ? "Codigo de area": "Country Code",
      values: phone ? phone?.country?.id : []
    });
    
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
};

export async function createAddressModal(address = undefined) {
  try {
    let buttonText,headerText;
    if(address){
      buttonText = isInSpanish ? "Actualizar" : "Update";
      headerText = isInSpanish ? "Actualizar Direccion" : "Update Address";
    } else {
      buttonText = isInSpanish ? "Crear" : "Create";
      headerText = isInSpanish ? "Agregar Direccion" : "Add Address";
    }
    createModal({
      headerTitle: headerText,
      formFields: [
        {
            label: isInSpanish ? "Etiqueta" : "Label",
            type: "text",
            name: "address-label",
            className:"",
            required: true,
            value: address ? address.label : '',
            placeHolder: isInSpanish ? "Etiqueta (ej: Casa)" : "Enter a label (e.g., Home)"
        },
        {
            label: isInSpanish ? "Direccion" :"Street",
            type: "text",
            name: "address-street",
            className:"",
            required: true,
            value: address ? address.street : '',
            placeHolder: isInSpanish ? "Direccion completa" : "Enter full street name"
        },
        {
            label: isInSpanish ? "Detalle" : "Detail",
            type: "text",
            name: "address-detail",
            className:"",
            required: false,
            value: address ? address.detail || '' : '',
            placeHolder: isInSpanish ? "Detalle (ej: 2b, apt 300)" : "Additional details (e.g., Apt, Floor)"
        },
        {
            label: isInSpanish ? "Codigo Postal" : "ZIP",
            type: "text",
            name: "address-zip",
            className:"short-input",
            required: true,
            value: address ? address.zip_code : '',
            placeHolder: isInSpanish ? "Codigo postal" :"ZIP code"
        },
        {
            label: isInSpanish ? "Ciudad" :"City",
            type: "text",
            name: "address-city",
            className:"",
            required: true,
            value: address ? address.city : '',
            placeHolder: isInSpanish ? "Ciudad" :"Enter the city"
        },
        {
            label: isInSpanish ? "Provincia" :"Province",
            type: "text",
            name: "address-province",
            className:"",
            required: true,
            value: address ? address.province : '',
            placeHolder: isInSpanish ? "Provincia" :"Enter the province"
        },
        {
            label: isInSpanish ? "Pais" :"Country",
            type: "select",
            name: "address-country-id",
            className:
              "ui search dropdown country_search_input form_search_dropdown",
            required: true,
            value: address ? address.country_id : '',
            placeHolder: isInSpanish ? "Elegi un pais" : "Select a country"
          },
      ],
     
      buttons: [
        {
          text: buttonText,
          className: "ui button submit negative send-modal-form-btn",
          onClick: async() => await handleAddressModalActions(address) ,
        },
      ],
      id: address ? address.id : undefined
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
    activateDropdown({
      className: classToActivate, 
      array: arrayToActivateInDropdown, 
      placeHolder : isInSpanish ? "Elegi un pais" : "Select Country",
      values: address ? [address.country_id] : []
  });
    
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
};

export async function createUserLoginModal(){
  try {
    createModal({
      headerTitle: "Login",
      formFields: [
        {
          label: "Email",
          type: "text",
          name: "user-email",
          required: true,
          placeHolder: "Email",
        },
        {
          label: "Password",
          type: "password",
          name: "user-password",
          required: true,
          placeHolder: "Password",
          icon: "eye link", // Icono de ojo
          iconCallback: toggleInputPasswordType
        },
      ],
      buttons: [
        {
          text: isInSpanish ? "Iniciar Sesión" : "login",
          className: "ui button submit negative send-modal-form-btn",
          onClick: async() => await handleUserLoginModal(),
        },
        {
          text: isInSpanish ?  "Registrarse" : "Sign up",
          className: "ui button right floated basic negative submit black sign-up-btn",
          onClick: async() => handleUserSignUpClick(),
        },
      ],
    });
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
}

export async function createUserSignUpModal(){
  try {
    createModal({
      headerTitle: isInSpanish ? "Registrarse" : "Sign up",
      formFields: [
        {
          type: "two-fields",
          fields: [
              {
                  label: isInSpanish ? "Nombre":"First name",
                  type: "text",
                  name: "user-first-name",
                  className:"",
                  required: true,
                },
                {
                  label: isInSpanish ? "Apellido": "Last name",
                  type: "text",
                  className: "",
                  name: "user-last-name",
                  required: true,
                },
          ]
      },
        {
          label: "Email",
          type: "text",
          name: "user-email",
          required: true,
          placeHolder: "Email",
        },
        {
          label: isInSpanish ? "Contraseña" : "Password",
          type: "password",
          name: "user-password",
          required: true,
          placeHolder: "Password",
          icon: "eye link", // Icono de ojo
          iconCallback: toggleInputPasswordType
   
        },
        {
          type: "message-container",
          header: isInSpanish ? "Requisitos":"Requiriments",
          list: [
            isInSpanish ? "Longitud Minima: 8 Caracteres" : "Minimum Length: 8 Characters",
            isInSpanish ? "Al menos 1 mayuscula" : "At least 1 uppercase",
          ],
        },
        {
          label: isInSpanish ? "Confirmar contraseña" :"Confirm password",
          type: "password",
          name: "user-re-password",
          required: true,
          placeHolder: "Password",
          icon: "eye link", // Icono de ojo
          iconCallback: toggleInputPasswordType
        },
      ],
      buttons: [
        {
          text: isInSpanish ? "Registrarse" : "Sign up",
          className: "ui button submit negative send-modal-form-btn",
          onClick: async() => await handleUserSignUpModal(),
        },
      ],
    });
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
}

export function createModal({ headerTitle, formFields, buttons, id }) {
  const existingModal = document.querySelector(".ui.modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.className = "ui small modal";
  if (id) modal.dataset.db_id = id;

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `${headerTitle} <i class='bx bx-x close-modal-btn'></i>`;
  modal.appendChild(header);

  const content = document.createElement("div");
  content.className = "content";

  const form = document.createElement("form");
  form.className = "ui form";

  formFields.forEach((field) => {
    if (field.type === "two-fields") {
      const fieldContainer = document.createElement("div");
      fieldContainer.className = "two fields";

      field.fields.forEach((subField) => {
        const subFieldContainer = createField(subField);
        fieldContainer.appendChild(subFieldContainer);
      });

      form.appendChild(fieldContainer);
    } else {
      const fieldContainer = createField(field);
      form.appendChild(fieldContainer);
    }
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "field margin-field";

  buttons.forEach((button) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = button.className || "ui button";
    btn.textContent = button.text || "Button";
    btn.addEventListener("click", button.onClick || (() => {}));
    buttonContainer.appendChild(btn);
  });

  form.appendChild(buttonContainer);

  const errorMessage = document.createElement("div");
  errorMessage.className = "ui error message";
  form.appendChild(errorMessage);

  content.appendChild(form);
  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.querySelector(".close-modal-btn")?.addEventListener("click", () => {
    $(modal).modal("hide");
  });

  return modal;
}

function createField(field) {
  const fieldContainer = document.createElement("div");
  fieldContainer.className = `field ${field.required ? "required" : ""}`;

  if (field.label) {
    const label = document.createElement("label");
    label.textContent = field.label;
    fieldContainer.appendChild(label);
  }

  if (field.icon) {
    const iconInputContainer = document.createElement("div");
    iconInputContainer.className = "ui icon input";

    const input = document.createElement("input");
    input.type = field.type || "text";
    input.name = field.name || "";
    input.placeholder = field.placeHolder || "";
    input.required = field.required || false;
    input.className = field.className || "";

    const icon = document.createElement("i");
    icon.className = `${field.icon} icon`;

    if (field.iconCallback && typeof field.iconCallback === "function") {
      icon.addEventListener("click", (event) => field.iconCallback(event, input));
    }

    iconInputContainer.appendChild(input);
    iconInputContainer.appendChild(icon);
    fieldContainer.appendChild(iconInputContainer);
  } else if (field.type === "select") {
    const select = document.createElement("select");
    select.name = field.name || "";
    select.className = field.className || "ui dropdown";
    select.required = field.required || false;

    if (Array.isArray(field.options)) {
      field.options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value || "";
        optionElement.textContent = option.label || "";
        if (option.selected || option.value == field.value) optionElement.selected = true;
        select.appendChild(optionElement);
      });
    }

    fieldContainer.appendChild(select);
  } else {
    const input = document.createElement("input");
    input.type = field.type || "text";
    input.name = field.name || "";
    input.value = field.value || "";
    input.placeholder = field.placeHolder || "";
    input.required = field.required || false;
    input.className = field.className || "";
    fieldContainer.appendChild(input);
  }

  return fieldContainer;
}


export function userInfoComponent(props) {
  const { first_name, last_name, email } = props;

  // Crear el contenedor principal
  const container = document.createElement('div');
  container.className = 'user-info-container';

  // Crear el círculo con las iniciales del usuario
  const initials = `${(first_name?.charAt(0) || '').toUpperCase()}${(last_name?.charAt(0) || '').toUpperCase()}`;
  const initialsCircle = document.createElement('p');
  initialsCircle.className = 'user-initials-circle';
  initialsCircle.textContent = initials || 'N/A'; // Muestra 'N/A' si no hay iniciales

  // Crear el campo de email
  const emailField = document.createElement('div');
  emailField.className = 'user-email-field';

  const emailLabel = document.createElement('label');
  emailLabel.textContent = 'Email';

  const emailText = document.createElement('p');
  emailText.className = 'user-email';
  emailText.textContent = email; // Muestra un mensaje si no hay email

  // Ensamblar el campo de email
  emailField.appendChild(emailLabel);
  emailField.appendChild(emailText);

  // Ensamblar el contenedor principal
  container.appendChild(initialsCircle);
  container.appendChild(emailField);

  return container;
}


export const createLoadingSpinner = (optionalClassName) => {
  const loadingState = document.createElement("div");
  loadingState.className = `loading-state ${optionalClassName}`;
  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading";
  loadingState.appendChild(loadingSpinner);
  return loadingState;
}