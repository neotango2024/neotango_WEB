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