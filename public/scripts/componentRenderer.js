export function checkoutCard (props) {
    const container = document.createElement("div");
    container.className = "card checkout_card";
    container.dataset.price = props.price
    // Image section
    const imageDiv = document.createElement("div");
    imageDiv.className = "card_image";
    const img = document.createElement("img");
    img.src = props.filename; // Usa la propiedad filename para la imagen
    img.alt = `Image_${Math.random().toString(36).substring(7)}`; // Genera un alt aleatorio
    imageDiv.appendChild(img);
  
    // Content section
    const contentDiv = document.createElement("div");
    contentDiv.className = "card_content";
  
    // Header
    const header = document.createElement("a");
    header.className = "card_header";
    header.href = `/product/1`; // Puedes parametrizar este enlace si es necesario
    header.textContent = props.name;
  
    // Meta
    const metaDiv = document.createElement("div");
    metaDiv.className = "meta";
    const categorySpan = document.createElement("span");
    categorySpan.className = "card_desc";
    categorySpan.textContent = props.category;
    metaDiv.appendChild(categorySpan);
  
    // Price
    const priceSpan = document.createElement("span");
    priceSpan.className = "card_price";
    priceSpan.textContent = `$${parseInt(props.quantity)*parseFloat(props.price)}`;
  
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
    cardHeader.className = 'card_header address_name';
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