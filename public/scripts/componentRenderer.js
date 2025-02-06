import { userLogged } from "./checkForUserLogged.js";
import {
  categoriesFromDB,
  countriesFromDB,
  setCategories,
  setCountries,
  setSizes,
  setTacos,
  sizesFromDB,
  statusesFromDB,
  tacosFromDB,
} from "./getStaticTypesFromDB.js";
import { isInSpanish, settedLanguage } from "./languageHandler.js";
import {
  handleAddressModalActions,
  handlePhoneModalActions,
  handleProductModalActions,
  handleUserLoginModal,
  handleUserSignUpModal,
} from "./modalHandlers.js";
import {
  activateCheckboxTogglers,
  activateDropdown,
  checkForSizeSelects,
  checkForVariationsSelects,
  displayBigNumbers,
  generateRandomString,
  getDateString,
  getProductImageSizeUrl,
  getProductMainImage,
  handleNewAddressButtonClick,
  handleNewPhoneButtonClick,
  handlePageModal,
  handleRemoveAddressButtonClick,
  handleRemovePhoneButtonClick,
  handleUserSignUpClick,
  setupSelectListeners,
  handleInputFileFromModal,
  toggleInputPasswordType,
  getDeepCopy,
  productsFromDB,
  updateProductTable,
  showCardMessage,
} from "./utils.js";
const SCREEN_WIDTH = window.screen.width;

export function checkoutCard(props) {
  const productFromDB = props;
  const productMainFile = productFromDB.files?.find((file) => file.main_file);
  props.quantity = props.quantity || 1;
  const container = document.createElement("div");
  container.className = "card checkout-card";
  container.dataset.variation_id = props.variation_id;
  const productPrice = isInSpanish
    ? productFromDB.ars_price
    : productFromDB.usd_price;
  // Image section
  const imageDiv = document.createElement("div");
  imageDiv.className = "card-image";

  const img = document.createElement("img");

  // Configurar el srcset y src del elemento img usando productMainFile
  if (productMainFile?.file_urls?.length) {
    const fileUrls = productMainFile.file_urls
      .map((url) => `${url.url} ${url.size}`)
      .join(", ");
    img.srcset = fileUrls;
    img.src =
      productMainFile.file_urls[productMainFile.file_urls.length - 1].url;
    img.alt = productMainFile.filename; // Usar el nombre del archivo para alt
    // img.dataset.file_id = productMainFile.id; // Agregar un data attribute
    img.loading = "lazy"; // Cargar la imagen de manera perezosa
  } else {
    img.src = "/img/product/default.png";
    let randomNumber = generateRandomString(10);
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
  header.textContent = isInSpanish
    ? productFromDB.es_name
    : productFromDB.eng_name;

  // Meta
  const metaCategoryDiv = document.createElement("div");
  metaCategoryDiv.className = "meta";
  let categorySpan = document.createElement("span");
  categorySpan.className = "card-desc";
  categorySpan.textContent = isInSpanish
    ? productFromDB.category?.name.es
    : productFromDB.category?.name.en;
  metaCategoryDiv.appendChild(categorySpan);

  const metaVariationDiv = document.createElement("div");
  metaVariationDiv.className = "meta";
  categorySpan = document.createElement("span");
  categorySpan.className = "card-desc";
  categorySpan.textContent = `Taco: ${props.tacoFromDB?.name} || ${
    isInSpanish ? "Talle:" : `Size:`
  } ${props.sizeFromDB?.size}`;
  metaVariationDiv.appendChild(categorySpan);

  // Price
  const priceSpan = document.createElement("span");
  priceSpan.className = "card-price";
  priceSpan.textContent = `$${displayBigNumbers(
    parseInt(props.quantity) * parseFloat(productPrice)
  )}`;

  // Amount container
  const amountContainer = document.createElement("div");
  amountContainer.className = "card_amount_container";

  const trashIcon = document.createElement("i");
  trashIcon.className = `trash alternate outline icon remove_card_btn ${
    props.quantity <= 1 ? "" : "hidden"
  }`;

  const quantitySpan = document.createElement("span");
  quantitySpan.className = "card_product_amount";
  quantitySpan.textContent = props.quantity;

  const addButton = document.createElement("button");
  const removeButton = document.createElement("button");
  removeButton.className = `ui button number_button remove_more_product ${
    props.quantity > 1 ? "" : "hidden"
  }`;
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
  container.innerHTML += `<div class="ui dimmer">
    <div class="ui loader"></div>
  </div>`;
  return container;
}

export function addressCard(props) {
  // Crear el contenedor principal con clases y data-id
  const card = document.createElement("div");
  card.className = "card address_card";
  card.setAttribute("data-id", props?.id);

  // Si props es undefined, pintar el "+" y texto centrado
  if (!props) {
    card.classList.add("card_empty"); // Agregar clase opcional para estilos específicos

    // Crear el contenido centrado
    const addIcon = document.createElement("div");
    addIcon.className = "add_icon";
    addIcon.textContent = "+";

    const addText = document.createElement("p");
    addText.className = "add_text";
    addText.textContent = isInSpanish ? "Agregar" : "Add"; // Basado en la variable global

    card.appendChild(addIcon);
    card.appendChild(addText);

    return card; // Retornar la tarjeta con contenido centrado
  }
  // Crear la sección superior de la tarjeta
  const cardTopContent = document.createElement("div");
  cardTopContent.className = "card-top-content";

  const cardHeader = document.createElement("p");
  cardHeader.className = "card-header address_name";
  cardHeader.textContent = props.label;

  const defaultAddressMarker = document.createElement("div");
  defaultAddressMarker.className = `default_address_marker ${
    props.default ? "default_marker_active" : ""
  } default_marker default_absolute_marker`;

  cardTopContent.appendChild(cardHeader);
  cardTopContent.appendChild(defaultAddressMarker);

  // Crear la sección de contenido de la tarjeta
  const cardContent = document.createElement("div");
  cardContent.className = "card-content";

  const street = document.createElement("p");
  street.className = "card_text address_street";
  street.textContent = props.street;

  const detail = document.createElement("p");
  detail.className = "card_text address_detail";
  detail.textContent = props.detail;

  const zip = document.createElement("p");
  zip.className = "card_text";
  zip.innerHTML = `CP: <span class="address_zip">${props.zip_code}</span>`;

  const city = document.createElement("p");
  city.className = "card_text address_city";
  city.textContent = props.city;

  const country = document.createElement("p");
  country.className = "card_text address_country";
  country.textContent = props.country;

  cardContent.appendChild(street);
  cardContent.appendChild(detail);
  cardContent.appendChild(zip);
  cardContent.appendChild(city);
  cardContent.appendChild(country);

  // Crear la sección inferior de la tarjeta
  const cardBottomContainer = document.createElement("div");
  cardBottomContainer.className = "card_botton_container";

  const editLink = document.createElement("p");
  editLink.className = "card_link edit_address_card_btn";
  editLink.textContent = isInSpanish ? "Editar" : "Edit";
  editLink.addEventListener(
    "click",
    async () => await handleNewAddressButtonClick(props)
  );

  const deleteLink = document.createElement("p");
  deleteLink.className = "card_link destroy_address_card_btn";
  deleteLink.textContent = isInSpanish ? "Eliminar" : "Remove";
  deleteLink.addEventListener(
    "click",
    async () => await handleRemoveAddressButtonClick(props)
  );

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
  const card = document.createElement("div");
  card.className = "card phone-card";
  card.setAttribute("data-id", props?.id);

  // Si props es undefined, pintar el "+" y texto centrado
  if (!props) {
    card.classList.add("card_empty"); // Agregar clase opcional para estilos específicos

    // Crear el contenido centrado
    const addIcon = document.createElement("div");
    addIcon.className = "add_icon";
    addIcon.textContent = "+";

    const addText = document.createElement("p");
    addText.className = "add_text";
    addText.textContent = isInSpanish ? "Agregar" : "Add"; // Basado en la variable global

    card.appendChild(addIcon);
    card.appendChild(addText);

    return card; // Retornar la tarjeta con contenido centrado
  }

  // Crear el marcador de teléfono predeterminado
  const defaultPhoneMarker = document.createElement("div");
  defaultPhoneMarker.className = `default_phone_marker default_marker ${
    props.default ? "default_marker_active" : ""
  } default_absolute_marker`;

  // Crear la sección de contenido de la tarjeta
  const cardContent = document.createElement("div");
  cardContent.className = "card-content";

  const phoneNumber = document.createElement("p");
  phoneNumber.className = "card_text phone_number";
  phoneNumber.textContent = `(+${props.country?.code}) ${props.phone_number}`;

  const phoneCountry = document.createElement("p");
  phoneCountry.className = "card_text phone_country";
  phoneCountry.textContent = props?.country?.name;

  cardContent.appendChild(phoneNumber);
  cardContent.appendChild(phoneCountry);

  // Crear la sección inferior de la tarjeta
  const cardBottomContainer = document.createElement("div");
  cardBottomContainer.className = "card_botton_container";

  const editLink = document.createElement("p");
  editLink.className = "card_link edit_phone_card_btn";
  editLink.textContent = isInSpanish ? "Editar" : "Edit";
  editLink.addEventListener(
    "click",
    async () => await handleNewPhoneButtonClick(props)
  );

  const deleteLink = document.createElement("p");
  deleteLink.className = "card_link destroy_phone_card_btn";
  deleteLink.textContent = isInSpanish ? "Eliminar" : "Remove";
  deleteLink.addEventListener(
    "click",
    async () => await handleRemovePhoneButtonClick(props)
  );

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
  container.dataset.db_id = order.id || "";

  // Top content: Fecha y estado de la orden
  const topContentDiv = document.createElement("div");
  topContentDiv.className = "card-top-content";

  const dateParagraph = document.createElement("p");
  dateParagraph.className = "card-date";
  const orderDateString = getDateString(order.createdAt);

  dateParagraph.textContent = orderDateString;

  const statusParagraph = document.createElement("p");
  statusParagraph.className = `card-status ${order.orderStatus.class}`;
  statusParagraph.textContent = isInSpanish
    ? order.orderStatus?.status?.es
    : order.orderStatus?.status?.en; // Función para convertir el ID de estado en texto

  topContentDiv.appendChild(dateParagraph);
  topContentDiv.appendChild(statusParagraph);

  // Items de la orden
  const itemsContainer = document.createElement("div");
  itemsContainer.className = "card-items-container";

  order.orderItems?.forEach((orderItem, i) => {
    const itemContainer = document.createElement("div");
    itemContainer.className = "card-order-item-container";

    // Imagen del producto
    const imageDiv = document.createElement("div");
    imageDiv.className = "card-image";

    const img = document.createElement("img");
    const imgSrc = orderItem.product?.files[0]?.file_urls[0].url;
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
    header.textContent = `${
      isInSpanish
        ? orderItem.es_name
        : orderItem.eng_name || "Producto sin nombre"
    } (${orderItem.quantity})`;

    const metaCategoryDiv = document.createElement("div");
    metaCategoryDiv.className = "meta";
    const categorySpan = document.createElement("span");
    categorySpan.className = "card-desc";
    const categoryName = orderItem?.product?.category
      ? isInSpanish
        ? orderItem?.product?.category?.name?.es
        : orderItem?.product?.category?.name?.en
      : isInSpanish
      ? "Zapato de tango"
      : "Tango Shoe";

    categorySpan.textContent = categoryName;
    metaCategoryDiv.appendChild(categorySpan);

    const metaVariationDiv = document.createElement("div");
    metaVariationDiv.className = "meta";
    const variationSpan = document.createElement("span");
    variationSpan.className = "card-desc";
    variationSpan.textContent = `Taco: ${orderItem.taco || "N/A"} || Talle: ${
      orderItem.size || "N/A"
    }`;
    metaVariationDiv.appendChild(variationSpan);

    const priceSpan = document.createElement("span");
    priceSpan.className = "card-price";
    priceSpan.textContent = `$${(orderItem.quantity * orderItem.price).toFixed(
      2
    )}`;

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
    case 1:
      return "Pendiente";
    case 2:
      return "En proceso";
    case 3:
      return "Enviado";
    case 4:
      return "Entregado";
    default:
      return "Desconocido";
  }
}

export function homeLabel(props) {
  // Crear el contenedor principal
  const accordion = document.createElement("div");
  accordion.className = "ui styled fluid accordion home_label";

  // Crear el título
  const title = document.createElement("div");
  title.className = "title";

  const icon = document.createElement("i");
  icon.className = "dropdown icon";

  const titleText = document.createTextNode(props.name);

  title.appendChild(icon);
  title.appendChild(titleText);

  // Crear el contenido
  const content = document.createElement("div");
  content.className = "content";

  // Verificar si desc tiene más de un elemento
  if (Array.isArray(props.desc) && props.desc.length > 1) {
    const ul = document.createElement("ul");
    props.desc.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    const paragraph = document.createElement("p");
    paragraph.appendChild(ul);
    content.appendChild(paragraph);
  } else {
    const paragraph = document.createElement("p");
    paragraph.className = "transition hidden";
    paragraph.textContent = Array.isArray(props.desc)
      ? props.desc[0]
      : props.desc;
    content.appendChild(paragraph);
  }

  // Ensamblar el contenedor
  accordion.appendChild(title);
  accordion.appendChild(content);

  return accordion;
}

export function form(props) {
  const {
    formClasses,
    inputProps,
    formTitleObject,
    formAction,
    method,
    buttonProps,
  } = props;
  const container = document.createElement("div");
  container.className = "form-container";

  const h3Element = document.createElement("h3");
  h3Element.className = "title";
  h3Element.textContent = formTitleObject?.title;
  if (formTitleObject?.datasetObject) {
    const { dataKey, dataValue } = formTitleObject?.datasetObject;
    h3Element.dataset[dataKey] = dataValue;
  }
  container.appendChild(h3Element);

  const form = document.createElement("form");
  form.action = formAction;
  form.method = method || "POST";
  form.className = `custom-form ${formClasses || ''}`;
  container.appendChild(form);

  inputProps.forEach((input) => {
    const inputContainer = document.createElement("div");
    inputContainer.className = `input-container ${input.contClassNames}`;
    inputContainer.style.width = `${input.width}%`;

    let inputElement;

    if (input.type === "select") {
      // Crear un elemento select
      inputElement = document.createElement("select");
      inputElement.name = input.name || "";
      inputElement.required = input.required || false;
      inputElement.className = `form-select ${input.inpClassNames || ""}`;
      if (input.id) inputElement.id = input.id;

      // Agregar opciones al select
      (input.options || []).forEach((option) => {
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
    if (inputElement.type == "checkbox") {
      //Los agrego al reves y agrego la clase checkbox-container
      inputContainer.classList.add("checkbox-container");
      inputContainer.appendChild(inputElement);
      label && inputContainer.appendChild(label);
    } else if (input.type === "switchCheckbox") {
      inputElement.type = "checkbox";
      // Manejo de switchCheckbox
      const toggleContainer = document.createElement("div");
      toggleContainer.className = "ui toggle checkbox";
      inputElement.classList.add("hidden");
      inputElement.tabIndex = 0;

      toggleContainer.appendChild(inputElement);
      label && toggleContainer.appendChild(label);

      inputContainer.appendChild(toggleContainer);
    } else {
      label && inputContainer.appendChild(label);
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
  return container;
}

export function button(props) {
  const button = document.createElement("button");
  button.className = "ui button custom-btn";
  button.textContent = props.text || "Submit";

  button.style.width = `${props.width}%`;
  button.style.backgroundColor = props.backgroundColor || "#bf0c12";
  button.style.color = props.fontColor || "white";
  button.style.fontSize = `${props.fontSize}%`;
  button.style.marginTop = props.marginTop ? `${props.marginTop}%` : "3%";
  button.style.marginBottom = props.marginBottom
    ? `${props.marginBottom}%`
    : "3%";

  if (typeof props.onClick === "function") {
    button.onclick = props.onClick;
  }

  const formContainer = document.querySelector(props.container);
  formContainer?.appendChild(button);
  if (props.datasetObject) {
    const { dataKey, dataValue } = props.datasetObject;
    button.dataset[dataKey] = dataValue;
  }

  return button;
}

export function productCard(prod, infoFontSize, isCarouselCard = false) {
  const { id, es_name, eng_name, ars_price, usd_price } = prod;

  const card = document.createElement("div");
  card.className = `${isCarouselCard ? "carousel-card" : "product-card"}`;
  card.dataset.productId = id;

  const cardAnchor = document.createElement("a");
  cardAnchor.className = "product-card-anchor";
  cardAnchor.href = `/producto/${id}`;
  card.appendChild(cardAnchor);

  const imgContainer = document.createElement("div");
  imgContainer.className = "prod-img-container";
  cardAnchor.appendChild(imgContainer);

  const mainImage = getProductMainImage(prod);
  const imageUrl = mainImage ? getProductImageSizeUrl(mainImage) : "";
  const img = document.createElement("img");
  img.className = "prod-img";
  img.src = imageUrl;
  imgContainer.appendChild(img);

  const productInfoContainer = document.createElement("div");
  productInfoContainer.className = "product-info-container";
  cardAnchor.appendChild(productInfoContainer);

  const productName = document.createElement("span");
  productName.className = "product-name";
  productName.textContent = isInSpanish ? es_name : eng_name;
  productName.style.fontSize = infoFontSize ? `${infoFontSize}%` : "120%";

  const productPrice = document.createElement("span");
  productPrice.className = "product-price";
  productPrice.textContent = `$${isInSpanish ? ars_price : usd_price}`;
  productPrice.style.fontSize = infoFontSize ? `${infoFontSize}%` : "120%";

  productInfoContainer.appendChild(productName);
  productInfoContainer.appendChild(productPrice);
  return card;
}

export function createUserMenuBtn(props) {
  // Obtener la URL actual
  const currentUrl = window.location.pathname;

  // Crear el contenedor principal
  const container = document.createElement("div");
  container.className = "ui icon top right pointing dropdown user-menu-btn";

  // Agregar el ícono de menú
  const barsIcon = document.createElement("i");
  barsIcon.className = props.items[0].itemLogo;
  container.appendChild(barsIcon);

  // Crear el menú
  const menu = document.createElement("div");
  menu.className = "menu";

  // Agregar encabezado según el tipo
  const header = document.createElement("div");
  header.className = "header";
  if (props.type == 2) {
    //user
    header.textContent = isInSpanish ? "Configuracion" : "Settings";
  } else {
    //admin
    header.textContent = "Dashboard";
  }

  menu.appendChild(header);

  // Crear los elementos del menú
  props.items.forEach((item, i) => {
    const itemLink = document.createElement("a");
    itemLink.className = `item`;
    itemLink.dataset.index = i;
    itemLink.dataset.label = item.itemType;

    // Agregar clases adicionales si el tipo coincide con la URL actual
    if (props.actualIndexSelected == i)
      itemLink.classList.add("active", "selected");

    // Establecer el logo e ícono
    const icon = document.createElement("i");
    icon.className = item.itemLogo;
    itemLink.appendChild(icon);

    // Agregar el tooltip
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.textContent = item.itemLabel;
    itemLink.appendChild(tooltip);

    // Agregar el enlace al menú
    menu.appendChild(itemLink);
  });

  // Agregar el enlace de cierre de sesión
  const logoutLink = document.createElement("a");
  logoutLink.href = "/logout";
  logoutLink.className = "item";

  const logoutIcon = document.createElement("i");
  logoutIcon.className = "bx bx-door-open";
  logoutLink.appendChild(logoutIcon);

  const logoutTooltip = document.createElement("span");
  logoutTooltip.className = "tooltip";
  logoutTooltip.textContent = isInSpanish ? "Cerrar Sesion" : "Logout";
  logoutLink.appendChild(logoutTooltip);

  menu.appendChild(logoutLink);

  // Agregar el menú al contenedor
  container.appendChild(menu);

  // Insertar el contenedor en el DOM
  return container;
}

export async function createPhoneModal(phone) {
  try {
    let buttonText, headerText;
    if (phone) {
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
              label: isInSpanish ? "Codigo de area" : "Phone Area",
              type: "select",
              name: "phone_country_id",
              className:
                "ui search dropdown country_code_search_input form_search_dropdown",
              value: phone ? phone.country_id : "",
              required: true,
            },
            {
              label: isInSpanish ? "Numero de telefono" : "Phone Number",
              type: "text",
              className: "numeric-only-input",
              name: "phone_number",
              value: phone ? phone.phone_number : "",
              required: true,
            },
          ],
        },
        {
          label: isInSpanish ? "Telefono Predeterminado" : "Default Phone",
          type: "toggle",
          name: "phone_default",
          containerClassName: `${!userLogged ? "hidden" : ""}`,
          required: true,
          checked: phone ? phone.default : !userLogged?.phones?.length,
        },
      ],
      buttons: [
        {
          text: buttonText,
          className: "ui button submit negative send-modal-form-btn",
          onClick: async () => await handlePhoneModalActions(phone),
        },
      ],
      id: phone ? phone.id : undefined,
    });
    activateCheckboxTogglers();
    //Una vez creado el modal, activo con los paises
    if (!countriesFromDB.length) {
      await setCountries();
    }
    let classNameToActivate =
      ".ui.search.dropdown.country_code_search_input.form_search_dropdown";
    let arrayToActivateInDropdown = countriesFromDB
      ?.filter((count) => count.code)
      ?.map((country) => ({
        id: country.id,
        name: `+${country.code} (${country.name})`,
      }));

    // Ahora activo el select
    activateDropdown({
      className: classNameToActivate,
      array: arrayToActivateInDropdown,
      placeHolder: isInSpanish ? "Codigo de area" : "Country Code",
      values: phone ? phone?.country?.id : [],
    });
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
}

export async function createAddressModal(address = undefined) {
  try {
    let buttonText, headerText;
    if (address) {
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
          className: "",
          required: true,
          value: address ? address.label : "",
          placeHolder: isInSpanish
            ? "Etiqueta (ej: Casa)"
            : "Enter a label (e.g., Home)",
        },
        {
          label: isInSpanish ? "Direccion" : "Street",
          type: "text",
          name: "address-street",
          className: "",
          required: true,
          value: address ? address.street : "",
          placeHolder: isInSpanish
            ? "Direccion completa"
            : "Enter full street name",
        },
        {
          label: isInSpanish ? "Detalle" : "Detail",
          type: "text",
          name: "address-detail",
          className: "",
          required: false,
          value: address ? address.detail || "" : "",
          placeHolder: isInSpanish
            ? "Detalle (ej: 2b, apt 300)"
            : "Additional details (e.g., Apt, Floor)",
        },
        {
          label: isInSpanish ? "Codigo Postal" : "ZIP",
          type: "text",
          name: "address-zip",
          className: "short-input",
          required: true,
          value: address ? address.zip_code : "",
          placeHolder: isInSpanish ? "Codigo postal" : "ZIP code",
        },
        {
          label: isInSpanish ? "Ciudad" : "City",
          type: "text",
          name: "address-city",
          className: "",
          required: true,
          value: address ? address.city : "",
          placeHolder: isInSpanish ? "Ciudad" : "Enter the city",
        },
        {
          label: isInSpanish ? "Provincia" : "Province",
          type: "text",
          name: "address-province",
          className: "",
          required: true,
          value: address ? address.province : "",
          placeHolder: isInSpanish ? "Provincia" : "Enter the province",
        },
        {
          label: isInSpanish ? "Pais" : "Country",
          type: "select",
          name: "address-country-id",
          className:
            "ui search dropdown country_search_input form_search_dropdown",
          required: true,
          value: address ? address.country_id : "",
          placeHolder: isInSpanish ? "Elegi un pais" : "Select a country",
        },
        {
          label: isInSpanish ? "Direccion predeterminada" : "Default Address",
          type: "toggle",
          name: "address-default",
          containerClassName: `${!userLogged ? "hidden" : ""}`,
          required: true,
          checked: address ? address.default : !userLogged?.addresses?.length,
        },
      ],

      buttons: [
        {
          text: buttonText,
          className: "ui button submit negative send-modal-form-btn",
          onClick: async () => await handleAddressModalActions(address),
        },
      ],
      id: address ? address.id : undefined,
    });
    activateCheckboxTogglers();
    //Una vez creado el modal, activo con los paises
    if (!countriesFromDB.length) {
      await setCountries();
    }
    //Aca los paises van solo nombre
    let arrayToActivateInDropdown = countriesFromDB.map((country) => ({
      id: country.id,
      name: country.name,
    }));
    let classToActivate =
      ".ui.search.dropdown.country_search_input.form_search_dropdown";
    // Ahora activo el select
    activateDropdown({
      className: classToActivate,
      array: arrayToActivateInDropdown,
      placeHolder: isInSpanish ? "Elegi un pais" : "Select Country",
      values: address ? [address.country_id] : [],
    });
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
}

export async function createUserLoginModal() {
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
          iconCallback: toggleInputPasswordType,
        },
      ],
      buttons: [
        {
          text: isInSpanish ? "Iniciar Sesión" : "login",
          type: "button",
          className: "ui button submit negative send-modal-form-btn",
          onClick: async () => await handleUserLoginModal(),
        },
        {
          text: isInSpanish ? "Registrarse" : "Sign up",
          className:
            "ui button right floated basic negative submit black sign-up-btn",
          onClick: async () => handleUserSignUpClick(),
        },
      ],
    });
    // Armo el event listener
    document
      .querySelector(".ui.modal")
      .addEventListener("keydown", async (event) => {
        if (event.key === "Enter") {
          await handleUserLoginModal();
        }
      });
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
}

export async function createUserSignUpModal() {
  try {
    createModal({
      headerTitle: isInSpanish ? "Registrarse" : "Sign up",
      formFields: [
        {
          type: "two-fields",
          fields: [
            {
              label: isInSpanish ? "Nombre" : "First name",
              type: "text",
              name: "user-first-name",
              className: "",
              required: true,
            },
            {
              label: isInSpanish ? "Apellido" : "Last name",
              type: "text",
              className: "",
              name: "user-last-name",
              required: true,
            },
          ],
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
          iconCallback: toggleInputPasswordType,
        },
        {
          type: "message-container",
          header: isInSpanish ? "Requisitos" : "Requiriments",
          list: [
            isInSpanish
              ? "Longitud Minima: 8 Caracteres"
              : "Minimum Length: 8 Characters",
            isInSpanish ? "Al menos 1 mayuscula" : "At least 1 uppercase",
          ],
        },
        {
          label: isInSpanish ? "Confirmar contraseña" : "Confirm password",
          type: "password",
          name: "user-re-password",
          required: true,
          placeHolder: "Password",
          icon: "eye link", // Icono de ojo
          iconCallback: toggleInputPasswordType,
        },
      ],
      buttons: [
        {
          text: isInSpanish ? "Registrarse" : "Sign up",
          className: "ui button submit negative send-modal-form-btn",
          onClick: async () => await handleUserSignUpModal(),
        },
      ],
    });
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
}

export function createModal({
  headerTitle,
  formClassName = "",
  formFields,
  buttons,
  id,
}) {
  destroyExistingModal();
  const modal = document.createElement("div");
  modal.className = "ui small modal";
  if (id) modal.dataset.db_id = id;

  // Crear el header
  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `${headerTitle} <i class='bx bx-x close-modal-btn'></i>`;
  modal.appendChild(header);

  // Crear el contenido principal
  const content = document.createElement("div");
  content.className = "content";

  // Crear el formulario
  const form = document.createElement("form");
  form.className = `ui form ${formClassName}`;

  // Crear los campos del formulario
  formFields.forEach((field) => {
    if (field.type === "header") {
      // Crear un header <h4>
      const headerElement = document.createElement("h4");
      headerElement.className = "ui dividing header";
      headerElement.textContent = field.label || "";
      form.appendChild(headerElement);
    } else if (field.type.endsWith("-fields")) {
      const fieldContainer = document.createElement("div");

      // Reemplazar "-" con un espacio para generar la clase correcta
      fieldContainer.className = field.type.replace("-", " ");

      field.fields.forEach((subField) => {
        const subFieldContainer = createField(subField);
        fieldContainer.appendChild(subFieldContainer);
      });

      form.appendChild(fieldContainer);
    } else if (field.type === "inline-fields") {
      const inlineContainer = document.createElement("div");
      inlineContainer.className = "inline fields";

      field.fields.forEach((subField) => {
        const subFieldContainer = createField(subField);
        inlineContainer.appendChild(subFieldContainer);
      });

      const fieldWrapper = document.createElement("div");
      fieldWrapper.className = "field";
      fieldWrapper.appendChild(inlineContainer);
      form.appendChild(fieldWrapper);
    } else {
      const fieldContainer = createField(field);
      form.appendChild(fieldContainer);
    }
  });

  // Crear el contenedor de botones
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "field margin-field";

  buttons.forEach((button) => {
    const btn = document.createElement("button");
    btn.type = button.type || "button";
    btn.className = button.className || "ui button";
    btn.textContent = button.text || "Button";
    btn.dataset.method = button.method;
    if (button.onClick) {
      btn.addEventListener("click", button.onClick);
    }

    buttonContainer.appendChild(btn);
  });

  form.appendChild(buttonContainer);

  // Agregar mensaje de error
  const errorMessage = document.createElement("div");
  errorMessage.className = "ui error message";
  form.appendChild(errorMessage);

  content.appendChild(form);
  modal.appendChild(content);
  document.body.appendChild(modal);

  // Evento para cerrar el modal
  modal
    .querySelector(".close-modal-btn")
    ?.addEventListener("click", () => closeModal());

  return modal;
}

function createField(field) {
  // Crear el contenedor del campo
  const fieldContainer = document.createElement("div");
  fieldContainer.className = `field ${field.containerClassName || ""}`; // Usar containerClassName

  // Agregar etiqueta si está presente
  if (field.label) {
    const label = document.createElement("label");
    label.textContent = field.label;
    fieldContainer.appendChild(label);
  }

  // Manejo de nestedFields (para soportar estructuras complejas)
  if (field.nestedFields) {
    field.nestedFields.forEach((nestedField) => {
      const nestedElement = createField(nestedField);
      fieldContainer.appendChild(nestedElement);
    });
  }

  // Manejo de togglers
  if (field.type === "toggle") {
    const toggleWrapper = document.createElement("div");
    toggleWrapper.className = "ui toggle checkbox";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = field.name;
    input.className = field.className || "hidden";
    input.checked = field.checked;

    const label = document.createElement("label");
    label.textContent = field.labelForToggle || "";

    toggleWrapper.appendChild(input);
    toggleWrapper.appendChild(label);
    fieldContainer.appendChild(toggleWrapper);
  }

  // Manejo de tipo date
  if (field.type === "date") {
    const input = document.createElement("input");
    input.type = "date";
    input.name = field.name;
    input.className = field.className || "";
    input.required = field.required || false;

    if (field.value) {
      input.value = field.value;
    }

    fieldContainer.appendChild(input);
  }

  // Manejo de select
  if (field.type === "select") {
    const select = document.createElement("select");
    select.name = field.name;
    select.className = field.className || "ui dropdown";
    select.required = field.required || false;

    if (field.dataAttributes) {
      Object.entries(field.dataAttributes).forEach(([key, value]) => {
        select.dataset[key] = value;
      });
    }

    if (field.multiple) select.setAttribute("multiple", "");

    if (!field.options?.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Loading...";
      select.appendChild(opt);
    }

    (field.options || []).forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      if (field.value && field.value === option.value) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    fieldContainer.appendChild(select);
  }

  // Manejo de radio-group
  if (field.type === "radio-group") {
    const radioGroup = document.createElement("div");
    radioGroup.className = "inline fields";

    (field.options || []).forEach((option, index) => {
      const radioField = document.createElement("div");
      radioField.className = "field";

      const radioDiv = document.createElement("div");
      radioDiv.className = "ui radio checkbox";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = field.name;
      input.value = option.value;
      input.checked = option.checked || index === 0;
      input.required = field.required || false;

      const label = document.createElement("label");
      label.textContent = option.label;

      radioDiv.appendChild(input);
      radioDiv.appendChild(label);
      radioField.appendChild(radioDiv);
      radioGroup.appendChild(radioField);
    });

    fieldContainer.appendChild(radioGroup);
  }

  // Manejo de textarea
  if (field.type === "textarea") {
    const textarea = document.createElement("textarea");
    textarea.name = field.name;
    textarea.placeholder = field.placeholder || "";
    textarea.className = field.className || "";
    textarea.required = field.required || false;

    if (field.value) {
      textarea.value = field.value;
    }

    fieldContainer.appendChild(textarea);
  }

  // Manejo de input estándar (text, number, email, password)
  if (["text", "number", "email", "password"].includes(field.type)) {
    const input = document.createElement("input");
    input.type = field.type;
    input.name = field.name;
    input.placeholder = field.placeholder || "";
    input.className = field.className || "";
    input.required = field.required || false;

    if (field.value) {
      input.value = field.value;
    }

    // Opcionalmente, puedes agregar atributos específicos para inputs de contraseña
    if (field.type === "password") {
      input.autocomplete = field.autocomplete || "off";
    }

    fieldContainer.appendChild(input);
  }

  // Manejo de input file con extensiones permitidas
  if (field.type === "file") {
    const input = document.createElement("input");
    input.type = "file";
    input.name = field.name;
    input.className = field.className || "";
    input.required = field.required || false;

    if (field.multiple) {
      input.setAttribute("multiple", "");
    }

    // Validar extensiones permitidas
    if (
      Array.isArray(field.allowedExtensions) &&
      field.allowedExtensions.length > 0
    ) {
      input.accept = field.allowedExtensions.map((ext) => `.${ext}`).join(",");
    }

    fieldContainer.appendChild(input);
  }

  // Manejo de extraContent (debe agregarse al final del contenedor principal)
  if (field.extraContent) {
    const extraContentContainer = document.createElement("div");
    extraContentContainer.innerHTML = field.extraContent;
    fieldContainer.appendChild(extraContentContainer);
  }

  return fieldContainer;
}

export function destroyExistingModal() {
  const existingModal = document.querySelector(".ui.modal");
  if (existingModal) {
    existingModal.remove();
  }
}

export function closeModal() {
  $(".ui.modal").modal("hide");
}
export function userInfoComponent(props) {
  const { first_name, last_name, email } = props;

  // Crear el contenedor principal
  const container = document.createElement("div");
  container.className = "user-info-container";

  // Crear el círculo con las iniciales del usuario
  const initials = `${(first_name?.charAt(0) || "").toUpperCase()}${(
    last_name?.charAt(0) || ""
  ).toUpperCase()}`;
  const initialsCircle = document.createElement("p");
  initialsCircle.className = "user-initials-circle";
  initialsCircle.textContent = initials || "N/A"; // Muestra 'N/A' si no hay iniciales

  // Crear el campo de email
  const emailField = document.createElement("div");
  emailField.className = "user-email-field";

  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email";

  const emailText = document.createElement("p");
  emailText.className = "user-email";
  emailText.textContent = email; // Muestra un mensaje si no hay email

  // Ensamblar el campo de email
  emailField.appendChild(emailLabel);
  emailField.appendChild(emailText);

  // Ensamblar el contenedor principal
  container.appendChild(initialsCircle);
  container.appendChild(emailField);

  return container;
}

export function generateHeaderShopDropdown() {
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "ui menu header-dropdown nav-link-item";
  let shopWord = isInSpanish ? "Tienda" : "Shop";
  const dropdownTrigger = document.createElement("a");
  dropdownTrigger.className = "browse item header-nav-letter";
  dropdownTrigger.innerHTML = `${shopWord.toUpperCase()} <i class="dropdown icon"></i>`;

  const popupContainer = document.createElement("div");
  popupContainer.className =
    "ui fluid popup bottom left transition hidden header-dropdown-items-section";

  const columnDiv = document.createElement("div");
  columnDiv.className = "ui column";

  const header = document.createElement("h4");
  header.className = "ui header";
  header.textContent = shopWord;

  const listDiv = document.createElement("div");
  listDiv.className = "ui link list";

  const items = [
    {
      text: isInSpanish ? "Zapatos de hombre" : "Men shoes",
      href: "/categoria/2",
    },
    {
      text: isInSpanish ? "Zapatos de Mujer" : "Women shoes",
      href: "/categoria/1",
    },
  ];

  items.forEach((item) => {
    const link = document.createElement("a");
    link.className = "item";
    link.href = item.href;
    link.textContent = item.text;
    listDiv.appendChild(link);
  });

  columnDiv.appendChild(header);
  columnDiv.appendChild(listDiv);
  popupContainer.appendChild(columnDiv);
  dropdownContainer.appendChild(dropdownTrigger);
  dropdownContainer.appendChild(popupContainer);

  return dropdownContainer; // Puedes cambiar este selector para añadirlo donde quieras
}

export function generateUserLoggedDropdown() {
  const dropdownContainer = document.createElement("li");
  dropdownContainer.className =
    "ui menu header-dropdown user-action-item user-initials-container";

  const dropdownTrigger = document.createElement("a");
  dropdownTrigger.className = "browse item header-nav-letter";

  const initialsSpan = document.createElement("span");
  initialsSpan.className = "user-initials";
  const firstNameLetter = userLogged.first_name.split("")[0];
  const lastNameLetter = userLogged.last_name.split("")[0];
  initialsSpan.textContent = firstNameLetter + lastNameLetter;

  dropdownTrigger.appendChild(initialsSpan);

  const popupContainer = document.createElement("div");
  popupContainer.className =
    "ui fluid popup header-dropdown-items-section bottom left transition hidden";

  const columnDiv = document.createElement("div");
  columnDiv.className = "ui column";

  const header = document.createElement("h4");
  header.className = "ui header";
  header.textContent = "Menu";

  const listDiv = document.createElement("div");
  listDiv.className = "ui link list user-logged-list";
  const isAdmin = userLogged.user_role_id == 1;
  let items;
  if (isAdmin) {
    items = [
      { text: isInSpanish ? "Ventas" : "Orders", href: "/perfil?index=0" },
      { text: isInSpanish ? "Productos" : "Products", href: "/perfil?index=1" },
      { text: isInSpanish ? "Envios" : "Shippings", href: "/perfil?index=2" },
      { text: isInSpanish ? "Cerrar sesión" : "Logout", href: "/logout" },
    ];
  } else {
    items = [
      { text: isInSpanish ? "Perfil" : "Profile", href: "/perfil?index=0" },
      {
        text: isInSpanish ? "Mis Direcciones" : "My addresses",
        href: "/perfil?index=1",
      },
      {
        text: isInSpanish ? "Mis Telefonos" : "My phones",
        href: "/perfil?index=2",
      },
      {
        text: isInSpanish ? "Mis Compras" : "My orders",
        href: "/perfil?index=3",
      },
      { text: isInSpanish ? "Cerrar sesión" : "Logout", href: "/logout" },
    ];
  }

  items.forEach((item) => {
    const link = document.createElement("a");
    link.className = "item user-anchors";
    link.href = item.href;
    link.textContent = item.text;
    listDiv.appendChild(link);
  });

  columnDiv.appendChild(header);
  columnDiv.appendChild(listDiv);
  popupContainer.appendChild(columnDiv);
  dropdownContainer.appendChild(dropdownTrigger);
  dropdownContainer.appendChild(popupContainer);

  return dropdownContainer;
}

export const createLoadingSpinner = (optionalClassName) => {
  const loadingState = document.createElement("div");
  loadingState.className = `loading-state ${optionalClassName}`;
  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-circle";
  loadingState.appendChild(loadingSpinner);
  return loadingState;
};

export function generateVariationField(tacoVariations = []) {
  const tacoId = tacoVariations.length ? tacoVariations[0].taco_id : null;
  // Crear el contenedor principal
  const container = document.createElement("div");
  container.classList.add(
    "ui",
    "segment",
    "field",
    "margin-field",
    "variation-field"
  );

  // Crear el icono de eliminar
  const removeIcon = document.createElement("i");
  removeIcon.classList.add("bx", "bx-x", "remove-variation-btn", "remove-btn");

  // Crear el campo de selección (Taco)
  const variationHeaderField = document.createElement("div");
  variationHeaderField.classList.add("field", "variation-header-field");

  const label = document.createElement("label");
  label.textContent = "Taco";

  const select = document.createElement("select");
  select.name = "variation-taco-id";
  select.required = true;
  const productCategory = document.querySelector(
    'select[name="product-category-id"]'
  ).value;
  const options = tacosFromDB
    .filter((taco) => taco.category_id == productCategory)
    .map((taco) => ({
      value: taco.id,
      text: taco.name,
    }));

  options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.text;
    select.appendChild(option);
  });

  variationHeaderField.appendChild(label);
  variationHeaderField.appendChild(select);
  // Le pongo el valor del taco si es que tiene
  select.value = tacoId || "";

  // Crear el botón "Add Size"
  const addSizeButtonField = document.createElement("div");
  addSizeButtonField.classList.add(
    "field",
    "margin-field",
    "add-size-button-field"
  );

  const addButton = document.createElement("button");
  addButton.classList.add("ui", "button", "basic", "red", "tiny");
  addButton.textContent = "Agregar Talle";
  addButton.type = "button";

  addSizeButtonField.appendChild(addButton);

  // Crear el contenedor de tallas (donde se agregarán los tamaños)
  const variationSizesWrapper = document.createElement("div");
  variationSizesWrapper.classList.add("field", "variation-sizes-wrapper");

  // Agregar todos los elementos al contenedor principal
  container.appendChild(removeIcon);
  container.appendChild(variationHeaderField);
  container.appendChild(addSizeButtonField);
  container.appendChild(variationSizesWrapper);

  if (tacoVariations?.length) {
    //Aca llegaron variaciones, las genero
    tacoVariations.forEach((sizeStockVar) => {
      let sizeVariationElement = generateVariationSizeContainer({
        variation: sizeStockVar,
        tacoParentID: undefined,
      });
      variationSizesWrapper.appendChild(sizeVariationElement);
      checkForSizeSelects();
    });
  }
  return container;
}

export function generateVariationSizeContainer({
  variation = undefined,
  tacoParentID = undefined,
}) {
  // Crear el contenedor principal
  const container = document.createElement("div");
  container.classList.add("variation-size-container");

  // Crear el icono de eliminar
  const removeIcon = document.createElement("i");
  removeIcon.classList.add("bx", "bx-x", "remove-size-btn", "remove-btn");

  // Crear el primer field (Size)
  const sizeField = document.createElement("div");
  sizeField.classList.add("field");

  const sizeLabel = document.createElement("label");
  sizeLabel.textContent = "Size";

  const sizeSelect = document.createElement("select");
  sizeSelect.name = "variation-size-id";
  const sizeOptions = sizesFromDB.map((size) => ({
    value: size.id,
    text: size.size,
  }));

  sizeOptions.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.text;
    sizeSelect.appendChild(option);
  });

  sizeField.appendChild(sizeLabel);
  sizeField.appendChild(sizeSelect);

  sizeSelect.value = variation?.size_id || "";

  // Crear el segundo field (Stock)
  const stockField = document.createElement("div");
  stockField.classList.add("field");

  const stockLabel = document.createElement("label");
  stockLabel.textContent = "Stock";

  const stockInput = document.createElement("input");
  stockInput.type = "text";
  stockInput.name = "variation-stock";
  stockInput.placeholder = "";
  stockInput.required = true;
  stockInput.classList.add("numeric-only-input");
  stockInput.value = variation?.quantity || "";

  stockField.appendChild(stockLabel);
  stockField.appendChild(stockInput);

  // Agregar elementos al contenedor principal
  container.appendChild(removeIcon);
  container.appendChild(sizeField);
  container.appendChild(stockField);
  return container;
}

export async function createProductModal(product = undefined) {
  if (!categoriesFromDB.length) await setCategories();
  if (!sizesFromDB.length) await setSizes();
  if (!tacosFromDB.length) await setTacos();
  createModal({
    headerTitle: product ? "Edit Product" : "Create Product",
    formClassName: "",
    formFields: [
      {
        type: "two-fields",
        fields: [
          {
            type: "text",
            label: "Nombre (esp)",
            name: "product-es-name",
            placeholder: "Zapato",
            required: true,
            containerClassName: "required",
            value: product ? product.es_name : "",
          },
          {
            type: "text",
            label: "Nombre (eng)",
            name: "product-en-name",
            placeholder: "Shoe",
            required: true,
            containerClassName: "required",
            value: product ? product.eng_name : "",
          },
        ],
      },
      {
        type: "two-fields",
        fields: [
          {
            type: "text",
            label: "ARS Precio",
            name: "product-ars-price",
            placeholder: "50000",
            required: true,
            containerClassName: "required",
            value: product ? product.ars_price : "",
          },
          {
            type: "text",
            label: "USD Precio",
            name: "product-usd-price",
            placeholder: "50",
            required: true,
            containerClassName: "required",
            value: product ? product.usd_price : "",
          },
        ],
      },
      {
        type: "two-fields",
        fields: [
          {
            type: "textarea",
            label: "Descripcion (esp)",
            name: "product-es-description",
            placeholder:
              "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt, ex.",
            required: true,
            containerClassName: "required",
            value: product ? product.spanish_description : "",
          },
          {
            type: "textarea",
            label: "Descripcion (eng)",
            name: "product-en-description",
            placeholder:
              "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt, ex.",
            required: true,
            containerClassName: "required",
            value: product ? product.english_description : "",
          },
        ],
      },
      {
        type: "two-fields",
        fields: [
          {
            type: "text",
            label: "SKU",
            name: "product-sku",
            placeholder: "300xce",
            required: true,
            containerClassName: "required",
            value: product ? product.sku : "",
          },
          {
            type: "select",
            label: "Categoria",
            name: "product-category-id",
            options: categoriesFromDB.map((cat) => ({
              value: cat.id,
              label: cat.name.en,
            })),
            required: true,
            containerClassName: "required",
            value: product ? product.category_id : "",
          },
        ],
      },
      {
        type: "file",
        label: "Imagenes",
        name: "product-image",
        allowedExtensions: ["jpg", "jpeg", "png", "webp"],
        containerClassName: "input-file-container hidden",
        // multiple: true,
      },
      {
        type: "field",
        containerClassName: "margin-field files_thumb_field",
        extraContent: "", // Espacio donde se mostrarán las miniaturas de los archivos
      },
      {
        type: "field",
        extraContent:
          '<button class="ui button small basic red add-variation-btn" type="button">Agregar Variacion</button>',
      },
      {
        type: "field",
        containerClassName: "margin-field variations-wrapper-field",
        extraContent: "", // Espacio donde se agregarán variaciones dinámicamente
      },
    ],
    buttons: [
      {
        type: "button",
        className: "ui button submit negative send-modal-form-btn",
        text: product ? "Edit" : "Create",
        onClick: async () => await handleProductModalActions(product),
      },
      {
        text: "Eliminar",
        className: `ui button right floated basic black submit black sign-up-btn ${
          !product ? "hidden" : ""
        }`,
        onClick: async () => createDisableProductModal(product),
      },
    ],
    id: product?.id || undefined,
  });
  // Una vez lo creo, lo abro
  handlePageModal(true);
  // Ahora voy por las variaciones
  // Agrupar por taco.id en un array de arrays
  if (product) {
    let groupsByTacoId = Object.values(
      product.variations?.reduce((acc, item) => {
        const tacoId = item.taco.id;
        if (!acc[tacoId]) {
          acc[tacoId] = [];
        }
        acc[tacoId].push(item);
        return acc;
      }, {})
    );
    const tacoVariationWrapper = document.querySelector(
      ".ui.modal .variations-wrapper-field"
    );
    //Lo dejo unicamente por taco_id, size_id y el stock
    groupsByTacoId = groupsByTacoId.map((group) =>
      group.map((item) => ({
        taco_id: item.taco.id,
        size_id: item.size.id,
        quantity: item.quantity,
      }))
    );
    groupsByTacoId.forEach((tacoVariations) => {
      const tacoVariationElement = generateVariationField(tacoVariations);
      tacoVariationWrapper.appendChild(tacoVariationElement);
      checkForVariationsSelects();
    });
    if (!product.files?.length) {
      handleInputFileFromModal({ show: true });
    }
  } else {
    //ACa no vino producto, entocne smuestro el input de archivos
    handleInputFileFromModal({ show: true });
  }
  listenProductModalCategorySelect();
  // Ahora agrego las escuchas
  listenToProductModalBtns();
  // Para escuchar los files
  await setFilesThumb(product);
  setupSelectListeners(); //EScuchas para los tacos&sizes
}

export async function createDisableProductModal(product) {
  disableProductModal(product);
  handlePageModal(true);
  const form = document.querySelector(".ui.form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const idToSend = product.id;
    // Hago el fetch para borrar
    let response = await fetch(`/api/product/${idToSend}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    });
    if (response.ok) {
      response = await response.json();
      const productIndexFromList = productsFromDB?.findIndex(
        (dbProd) => dbProd.id == idToSend
      );
      if (productIndexFromList !== -1) {
        productsFromDB.splice(productIndexFromList, 1);
      }
      closeModal();
      showCardMessage(true, response.msg.es);
      return updateProductTable();
    }
    let msg = "Ha ocurrido un error";
    showCardMessage(false, msg);
    return
  });
}
function listenToProductModalBtns() {
  const addVariationBtn = document.querySelector(
    ".ui.modal .add-variation-btn"
  );
  const addVariationSizeBtns = document.querySelectorAll(
    ".ui.modal .add-size-button-field"
  );
  const removeVariationBtns = document.querySelectorAll(
    ".ui.modal .remove-variation-btn"
  );
  const removeVariationSizeBtns = document.querySelectorAll(
    ".ui.modal .remove-size-btn"
  );
  if (!addVariationBtn.dataset.listened) {
    addVariationBtn.dataset.listened = true;
    addVariationBtn.addEventListener("click", () => {
      const wrapper = document.querySelector(
        ".ui.modal .variations-wrapper-field"
      );
      const newField = generateVariationField();
      wrapper.appendChild(newField);
      checkForVariationsSelects();
      return listenToProductModalBtns();
    });
  }
  addVariationSizeBtns.forEach((btn) => {
    if (btn.dataset.listened) return;
    btn.dataset.listened = true;
    btn.addEventListener("click", () => {
      const wrapper = btn
        .closest(".variation-field")
        .querySelector(".variation-sizes-wrapper");
      const tacoParentID = btn
        .closest(".variation-field")
        .querySelector('select[name="variation-taco-id"]').value;

      const newField = generateVariationSizeContainer({
        variation: undefined,
        tacoParentID,
      });
      wrapper.appendChild(newField);
      checkForSizeSelects();
      return listenToProductModalBtns();
    });
  });
  removeVariationBtns.forEach((btn) => {
    if (btn.dataset.listened) return;
    btn.dataset.listened = true;
    btn.addEventListener("click", () => {
      const wrapper = btn.closest(".variation-field");
      wrapper.remove();
      checkForVariationsSelects();
    });
  });
  removeVariationSizeBtns.forEach((btn) => {
    if (btn.dataset.listened) return;
    btn.dataset.listened = true;
    btn.addEventListener("click", () => {
      const wrapper = btn.closest(".variation-size-container");
      wrapper.remove();
      checkForSizeSelects();
    });
  });
}

function listenProductModalCategorySelect() {
  const categorySelect = document.querySelector(
    '.ui.modal select[name="product-category-id"]'
  );
  categorySelect.addEventListener("change", () => {
    const variationsWrapper = document.querySelector(
      ".ui.modal .variations-wrapper-field"
    );
    variationsWrapper.innerHTML = "";
  });
}

async function setFilesThumb(product = undefined) {
  try {
    product = (product && getDeepCopy(product)) || undefined; //No quiero alterar el que llega
    // Obtener input de archivos
    let fileInput = document.querySelector(".ui.modal input[type=file]");
    let divContainer = document.querySelector(".ui.modal .files_thumb_field");
    let files = [];

    // Limpiar el contenedor de imágenes
    divContainer.innerHTML = "";

    // Si hay un producto, pintar sus imágenes existentes
    if (product?.files?.length) {
      setProductFiles();

      // Agregar imágenes del producto al contenedor
      files.forEach((file, index) => {
        const imageBox = getImageBoxHTML({ file, index, isProductFile: true });
        divContainer.innerHTML += imageBox;
      });

      listenToImageClick(); // Escuchar cambios en selección
    }

    // Escuchar cambios en el input de archivos
    fileInput.addEventListener("change", (e) => {
      let fileObject = e.target.files;
      setProductFiles(); //Seteo los que tenia el producto
      fileObject.length && handleInputFileFromModal({ show: false }); //Oculto el input si es que vino una imagen
      // Recorrer y agregar archivos nuevos
      for (let i = 0; i < fileObject.length; i++) {
        const file = fileObject[i];
        file.main_file = files.length === 0 && i === 0; // Si es el primer archivo, marcarlo como principal
        files.push(file);
      }

      // Convertir archivos a base64 para previsualización
      let counter = 0; //Esto es porque para los archivos de producto no puedo usar i, entonces va a sunmar y no quiero
      const filePromises = files.map((file, i) => {
        return new Promise((resolve) => {
          if (file.thumb_url) {
            // Si el archivo ya tiene una URL (es del producto existente)
            resolve(
              getImageBoxHTML({ file, index: undefined, isProductFile: true })
            );
          } else {
            // Si es un nuevo archivo, leerlo en base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
              file.thumb_url = reader.result; // Asignar la vista previa
              resolve(
                getImageBoxHTML({ file, index: counter, isProductFile: false })
              );
              counter++;
            };
          }
        });
      });

      // Agregar imágenes al contenedor
      Promise.all(filePromises).then((boxes) => {
        divContainer.innerHTML = ""; // Limpiar antes de agregar nuevas imágenes
        boxes.forEach((box) => (divContainer.innerHTML += box));
        listenToImageClick();
      });
    });

    // Generar el HTML de cada imagen
    function getImageBoxHTML({ file, index, isProductFile }) {
      return `
       <div class="image-radio-box ${
         !isProductFile ? "input-file" : "product-file"
       }" ${
        !isProductFile
          ? `data-index="${index}"`
          : `data-filename="${file.name}" data-db_id = "${file.id}"`
      }>
            <p class="remove-image-box-anchor no-margin">Remove</p>
           <div class="image-container">
               <img src="${file.thumb_url}" 
                    srcset="${
                      file.file_urls
                        ? file.file_urls
                            .map((url) => `${url.url} ${url.size}`)
                            .join(", ")
                        : file.thumb_url
                    }" 
                    alt="${file.name}" class="image-to-select-main">
           </div>
           <input type="radio" name="mainImage" value="${file.name}" 
                  class="radio-from-image" ${file.main_file ? "checked" : ""}>
       </div>
     `;
    }

    // Manejar selección de imagen principal
    function listenToImageClick() {
      const imagesRadioBoxes = document.querySelectorAll(
        ".ui.modal .image-radio-box"
      );

      imagesRadioBoxes.forEach((box) => {
        if (box.dataset.listened) return;
        box.dataset.listened = true;
        box.addEventListener("click", () => {
          const index = parseInt(box.dataset.index);

          // Actualizar la propiedad main_file en el array
          files.forEach((file, i) => {
            file.main_file = i === index;
          });

          // Marcar el radio button como seleccionado
          box.querySelector('input[type="radio"]').checked = true;
        });
      });
      const removeAnchors = document.querySelectorAll(
        ".remove-image-box-anchor"
      );
      removeAnchors.forEach((anchor) => {
        if (anchor.dataset.listened) return;
        anchor.dataset.listened = true;
        anchor.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          const containerToRemove = e.target.closest(".image-radio-box");
          const index = containerToRemove.dataset?.index;
          if (index) {
            //Aca selecciono una de las nuevas
            removeFileFromInput(index);
            containerToRemove.remove();
            // Ahora como borre el contenedor, tengo que reasignar
            const inputImagesLeft = document.querySelectorAll(
              ".image-radio-box.input-file"
            );
            inputImagesLeft.forEach((element, i) => {
              element.dataset.index = i;
            });
          } else {
            const idToRemove = anchor.closest(".image-radio-box.product-file")
              .dataset.db_id;
            product.files = product.files?.filter(
              (file) => file.id != idToRemove
            );
            //Aca esta queriendo borrar una imagen del producto en si, boror el contenedor y lo borro de imagenes dle producto
            containerToRemove.remove();
          }
          handleInputFileFromModal({ show: true });
        });
      });
    }
    function removeFileFromInput(index) {
      let fileInput = document.querySelector(
        ".ui.modal input[name='product-image']"
      );

      // Crear un objeto DataTransfer
      let dt = new DataTransfer();

      let files = fileInput.files;
      // Agregar solo los archivos que NO sean el que queremos eliminar
      for (let i = 0; i < files.length; i++) {
        if (i != index) {
          dt.items.add(files[i]);
        }
      }

      // Asignar los archivos filtrados al input
      fileInput.files = dt.files;
    }
    function setProductFiles() {
      files =
        product?.files?.map((file, index) => {
          return {
            id: file.id,
            name: file.filename,
            main_file: file.main_file || index === 0, // Si no hay main_file definido, el primero será el principal
            file_urls: file.file_urls,
            thumb_url: file.thumb_url,
          };
        }) || [];
    }
  } catch (error) {
    return console.log(error);
  }
}

export function generateOrderDetailModal(order, isAdminModal = false) {
  destroyExistingModal();
  // Crear modal principal
  const modal = document.createElement("div");
  modal.classList.add("ui", "small", "modal");

  // Crear header
  const header = document.createElement("div");
  header.classList.add("header");
  const headerWording = isInSpanish ? "Detalle de la compra" : "Order Detail";
  header.innerHTML = `${headerWording} <i class="bx bx-x close-modal-btn"></i>`;

  // Crear contenido principal
  const content = document.createElement("div");
  content.classList.add("content", "order-detail-modal-content");

  // Crear tarjeta de orden
  const orderCard = document.createElement("div");
  orderCard.classList.add("ui", "card", "order-detail-card");

  // Contenido de la tarjeta
  orderCard.innerHTML = `
      <div class="content">
          <div class="modal-card-header-span">${getDateString(
            order.createdAt
          )}</div>
          <div class="modal-card-header-span border-left align-end">#${
            order.tra_id
          }</div>
      </div>`;
  if (isAdminModal) {
    orderCard.innerHTML +=
      '<div class="content product-table-list-content"></div>'; //Esto es para pitnar los orderItems
  } else {
    orderCard.innerHTML += `
        <div class="content">
        <div class="modal-card-content-row">
            <span class="modal-card-content-span">${
              order.orderItemsPurchased
            } ${isInSpanish ? "productos" : "products"}</span>
            <span class="modal-card-content-span">$${
              order.orderItemsPurchasedPrice
            }</span>
        </div>
        </div>`;
  }
  orderCard.innerHTML += `
          <div class="content">
          <div class="modal-card-content-row no-margin">
              <span class="modal-card-content-span">${
                isInSpanish ? "Envio" : "Shipping"
              }</span>
              <span class="modal-card-content-span">$${
                order.shippingCost
              }</span>
          </div>
          </div>
      <div class="content">
          <span class="modal-card-content-row">
              <span class="modal-card-content-span bold">Total</span>
              <span class="modal-card-content-span bold">$${order.total}</span>
          </span>
      </div>
  `;
  let orderStatusSection = undefined;
  if (isAdminModal) {
    // Sección Detalle de Pago
    orderStatusSection = document.createElement("section");
    orderStatusSection.classList.add(
      "card-status-detail",
      "order-detail-card-section"
    );
    orderStatusSection.innerHTML = `
        <label class="card-label label">${
          isInSpanish ? "Estado de orden" : "Order status"
        }</label>
 <select class="ui select" id="orderStatusSelect">
            ${statusesFromDB
              .map(
                (status) => `
              <option value="${status.id}" ${
                  status.id === order.orderStatus.id ? "selected" : ""
                }>
                ${status.status.es}
              </option>
            `
              )
              .join("")}
              </select>
    `;
  }

  // Sección Detalle de Pago
  const paymentSection = document.createElement("section");
  paymentSection.classList.add(
    "card-payment-detail",
    "order-detail-card-section"
  );
  paymentSection.innerHTML = `
      <label class="card-label label">${
        isInSpanish ? "Detalle del pago" : "Payment detail"
      }</label>
      <div class="ui card">
          <div class="payment-logo-container card-logo-container">
              <img src="./img/logo/${
                order.paymentType?.filename
              }" alt="payment-logo">
          </div>
          <div class="payment-label-container card-label-container">
              <p class="payment-label card-label grey">${
                order.paymentType?.type
              }</p>
          </div>
      </div>
  `;

  // Sección Detalle de Envío
  const shippingSection = document.createElement("section");
  shippingSection.classList.add(
    "card-shipping-detail",
    "order-detail-card-section"
  );
  if (order.shippingType == 2) {
  }
  shippingSection.innerHTML = `
      <label class="card-label label">${
        isInSpanish ? "Detalle del envio" : "Shipping detail"
      }</label>
      <div class="ui card">
          <div class="shipping-logo-container card-logo-container">
              <i class="${
                order.shippingType?.iconClass
              } card-logo-i" title = "${
    isInSpanish ? order.shippingType?.type.es : order.shippingType?.type.en
  }"></i>
          </div>
          <div class="card-label-container">
              <p class="card-label grey no-margin">${
                isInSpanish
                  ? order.shippingType?.type.es
                  : order.shippingType?.type.en
              }</p>
                
              <p class="card-desc grey no-margin">${
                order.shippingType.id == 1
                  ? order.shipping_address_street
                  : "Sarmiento 1938"
              }</p>
              <p class="card-desc grey no-margin">${
                order.shippingType.id == 1
                  ? order.shipping_address_detail || ""
                  : ""
              }</p>
              <p class="card-desc grey no-margin">${
                order.shippingType.id == 1
                  ? order.shipping_address_city
                  : "CABA"
              }, ${
    order.shippingType.id == 1
      ? order.shipping_address_province
      : "Buenos Aires"
  }</p>
          </div>
      </div>
  `;

  // Sección Detalle de facturacion
  const billingSection = document.createElement("section");
  billingSection.classList.add(
    "card-billing-detail",
    "order-detail-card-section"
  );
  billingSection.innerHTML = `
      <label class="card-label label">${
        isInSpanish ? "Detalle de facturacion" : "Billing detail"
      }</label>
      <div class="ui card">
          <div class="card-label-container">
          <p class="card-label grey no-margin">${
            isInSpanish ? "Cliente" : "Client"
          }</p>
              <p class="card-desc grey no-margin">${order.first_name} ${
    order.last_name
  }</p>
              <p class="card-desc grey no-margin">DNI: ${order.dni}</p>
              <p class="card-desc grey">Email: ${order.email}</p>
              <p class="card-label grey no-margin">${
                isInSpanish ? "Direccion" : "Address"
              }</p>
              <p class="card-desc grey no-margin">${
                order.billing_address_street
              }</p>
              <p class="card-desc grey no-margin">${
                order.billing_address_detail
              }</p>
              <p class="card-desc grey no-margin">${
                order.billing_address_city
              }, ${order.billing_address_province}</p>
          </div>
      </div>
  `;
  // Ensamblar modal
  content.appendChild(orderCard);
  orderStatusSection && content.appendChild(orderStatusSection);
  content.appendChild(paymentSection);
  content.appendChild(shippingSection);
  content.appendChild(billingSection);
  modal.appendChild(header);
  modal.appendChild(content);
  modal.innerHTML += `<div class="ui dimmer">
    <div class="ui loader"></div>
  </div>`;
  // Agrego el closemodal even
  modal
    .querySelector(".close-modal-btn")
    ?.addEventListener("click", () => closeModal());

  return modal;
}

export function disableAddressModal(address) {
  destroyExistingModal();

  // Crear el contenedor principal
  const modal = document.createElement("div");
  modal.className = "ui small modal";

  // Crear el header del modal
  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `Disable Address <i class='bx bx-x close-modal-btn'></i>`;
  modal.appendChild(header);

  const closeModalBtn = modal.querySelector(".close-modal-btn");
  closeModalBtn.addEventListener("click", () => closeModal());

  // Crear el contenido del modal
  const content = document.createElement("div");
  content.className = "content";

  // Crear el formulario
  const form = document.createElement("form");
  form.className = "ui form destroy-form";

  // Crear el encabezado dentro del formulario
  const headerText = document.createElement("h4");
  headerText.className = "ui dividing header required";
  headerText.innerHTML = isInSpanish
    ? `¿Estas seguro que quieres borrar "${address.label}"?`
    : `Are you sure you want to remove "${address.label}"?`;
  form.appendChild(headerText);

  // Crear el contenedor de botones
  const buttonFields = document.createElement("div");
  buttonFields.className = "two fields";

  // Botón de cancelación
  const cancelField = document.createElement("div");
  cancelField.className = "field";
  const cancelButton = document.createElement("button");
  cancelButton.className = "ui basic grey button";
  cancelButton.type = "button";
  cancelButton.textContent = isInSpanish ? "Cancelar" : "Cancel";
  cancelField.appendChild(cancelButton);
  buttonFields.appendChild(cancelField);

  cancelButton.addEventListener("click", () => closeModal());

  // Botón de confirmación
  const confirmField = document.createElement("div");
  confirmField.className = "field";
  const confirmButton = document.createElement("button");
  confirmButton.className = "ui basic red button";
  confirmButton.textContent = isInSpanish ? "Confirmar" : "Confirm";
  confirmButton.type = "submit";
  confirmField.appendChild(confirmButton);
  buttonFields.appendChild(confirmField);

  confirmButton.addEventListener("click", () =>
    confirmButton.classList.add("loading")
  );
  // Agregar los botones al formulario
  form.appendChild(buttonFields);

  // Agregar el formulario al contenido
  content.appendChild(form);

  // Agregar el contenido al modal
  modal.appendChild(content);

  // Agregar el modal al cuerpo del documento
  document.body.appendChild(modal);

  return modal;
}
export function disablePhoneModal(phone) {
  destroyExistingModal();

  // Crear el contenedor principal
  const modal = document.createElement("div");
  modal.className = "ui small modal";

  // Crear el header del modal
  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `Disable Phone <i class='bx bx-x close-modal-btn'></i>`;
  modal.appendChild(header);

  const closeModalBtn = modal.querySelector(".close-modal-btn");
  closeModalBtn.addEventListener("click", () => closeModal());

  // Crear el contenido del modal
  const content = document.createElement("div");
  content.className = "content";

  // Crear el formulario
  const form = document.createElement("form");
  form.className = "ui form destroy-form";

  // Crear el encabezado dentro del formulario
  const headerText = document.createElement("h4");
  headerText.className = "ui dividing header required";
  headerText.innerHTML = isInSpanish
    ? `¿Estas seguro que quieres borrar "${phone.phone_number}"?`
    : `Are you sure you want to remove "${phone.phone_number}"?`;
  form.appendChild(headerText);

  // Crear el contenedor de botones
  const buttonFields = document.createElement("div");
  buttonFields.className = "two fields";

  // Botón de cancelación
  const cancelField = document.createElement("div");
  cancelField.className = "field";
  const cancelButton = document.createElement("button");
  cancelButton.className = "ui basic grey button";
  cancelButton.type = "button";
  cancelButton.textContent = isInSpanish ? "Cancelar" : "Cancel";
  cancelField.appendChild(cancelButton);
  buttonFields.appendChild(cancelField);

  cancelButton.addEventListener("click", () => closeModal());

  // Botón de confirmación
  const confirmField = document.createElement("div");
  confirmField.className = "field";
  const confirmButton = document.createElement("button");
  confirmButton.className = "ui basic red button";
  confirmButton.textContent = isInSpanish ? "Confirmar" : "Confirm";
  confirmButton.type = "submit";
  confirmField.appendChild(confirmButton);
  buttonFields.appendChild(confirmField);

  confirmButton.addEventListener("click", () =>
    confirmButton.classList.add("loading")
  );
  // Agregar los botones al formulario
  form.appendChild(buttonFields);

  // Agregar el formulario al contenido
  content.appendChild(form);

  // Agregar el contenido al modal
  modal.appendChild(content);

  // Agregar el modal al cuerpo del documento
  document.body.appendChild(modal);

  return modal;
}
export function disableProductModal(product) {
  destroyExistingModal();
  // Crear el contenedor principal
  const modal = document.createElement("div");
  modal.className = "ui small modal";

  // Crear el header del modal
  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `Deshabilitar Producto <i class='bx bx-x close-modal-btn'></i>`;
  modal.appendChild(header);

  const closeModalBtn = modal.querySelector(".close-modal-btn");
  closeModalBtn.addEventListener("click", () => createProductModal(product));

  // Crear el contenido del modal
  const content = document.createElement("div");
  content.className = "content";

  // Crear el formulario
  const form = document.createElement("form");
  form.className = "ui form destroy-form";

  // Crear el encabezado dentro del formulario
  const headerText = document.createElement("h4");
  headerText.className = "ui dividing header required";
  headerText.innerHTML = `¿Estas seguro que quieres deshabilitar "${product.es_name}"?`;
  form.appendChild(headerText);

  // Crear el contenedor de botones
  const buttonFields = document.createElement("div");
  buttonFields.className = "two fields";

  // Botón de cancelación
  const cancelField = document.createElement("div");
  cancelField.className = "field";
  const cancelButton = document.createElement("button");
  cancelButton.className = "ui basic grey button";
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";
  cancelField.appendChild(cancelButton);
  buttonFields.appendChild(cancelField);

  cancelButton.addEventListener("click", () => createProductModal(product));

  // Botón de confirmación
  const confirmField = document.createElement("div");
  confirmField.className = "field";
  const confirmButton = document.createElement("button");
  confirmButton.className = "ui basic red button";
  confirmButton.textContent = isInSpanish ? "Confirmar" : "Confirm";
  confirmButton.type = "submit";
  confirmField.appendChild(confirmButton);
  buttonFields.appendChild(confirmField);

  confirmButton.addEventListener("click", () =>
    confirmButton.classList.add("loading")
  );
  // Agregar los botones al formulario
  form.appendChild(buttonFields);

  // Agregar el formulario al contenido
  content.appendChild(form);

  // Agregar el contenido al modal
  modal.appendChild(content);

  // Agregar el modal al cuerpo del documento
  document.body.appendChild(modal);
  return modal;
}
