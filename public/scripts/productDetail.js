import { productCard } from "./componentRenderer.js";
import { isInSpanish } from "./languageHandler.js";
import { productsFromDB, setProductsFromDB, scrollToTop, generateRandomString } from "./utils.js";

let productDetailExportObj = {
  createProductDetailsSection : null,
  paintRelatedProductCards: null,
}
import { deleteLocalStorageItem, getLocalStorageItem, setLocalStorageItem } from "./localStorage.js";
import { userLogged } from "./checkForUserLogged.js";

let productId;

window.addEventListener("load", async () => {
  try {
    
    if (!window.location.pathname.includes('/producto/')) return;

    productDetailExportObj.createProductDetailsSection = function(productData) {
      const breadcrumb = document.createElement("div");
      breadcrumb.className = "ui breadcrumb";
      breadcrumb.innerHTML = `
          <a class="section" href="/">Home</a>
          <div class="divider"> / </div>
          <a class="section" href="${productData?.category?.id}">${isInSpanish ? productData?.category?.name?.es : productData?.category?.name?.en}</a>
          <div class="divider"> / </div>
          <div class="active section">${isInSpanish ? productData?.es_name : productData?.eng_name}</div>
      `;

      const productName = document.createElement("h1");
      productName.className = "product-name";
      productName.textContent = isInSpanish ? productData?.es_name : productData?.eng_name;

      const productPrice = document.createElement("p");
      productPrice.className = "product-price";
      productPrice.textContent = `$${isInSpanish ? productData?.ars_price : productData?.usd_price}`;

      const productDescription = document.createElement("p");
      productDescription.className = "product-desc";
      productDescription.textContent = isInSpanish ? productData?.spanish_description : productData?.english_description;

      const selectsWrapper = document.createElement("div");
      selectsWrapper.className = "selects-wrapper";

      // Obtener tacos y talles únicos desde variations
      const tacos = [...new Map(productData?.variations.map((v) => [v.taco.id, v.taco])).values()];
      const sizes = [...new Map(productData?.variations.map((v) => [v.size.id, v.size])).values()];

      // Crear select para tacos
      const tacoSelectContainer = document.createElement("div");
      tacoSelectContainer.className = "select-container";
      const tacoSelect = document.createElement("select");
      tacoSelect.name = "taco-id";
      tacoSelect.id = "taco-id";

      tacoSelect.innerHTML = tacos
          .map((taco) => `<option value="${taco.id}">${taco.name}</option>`)
          .join("");

      tacoSelectContainer.innerHTML = `
          <label for="taco-id">Taco</label>
      `;
      tacoSelectContainer.appendChild(tacoSelect);

      // Crear select para talles
      const sizeSelectContainer = document.createElement("div");
      sizeSelectContainer.className = "select-container";
      const sizeSelect = document.createElement("select");
      sizeSelect.name = "size-id";
      sizeSelect.id = "size-id";

      sizeSelect.innerHTML = sizes
          .map((size) => `<option value="${size.id}">${size.size}</option>`)
          .join("");

      sizeSelectContainer.innerHTML = `
          <label for="size-id">${isInSpanish ? 'Talle' : "Size"}</label>
      `;
      sizeSelectContainer.appendChild(sizeSelect);

      selectsWrapper.appendChild(tacoSelectContainer);
      selectsWrapper.appendChild(sizeSelectContainer);

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";
      buttonContainer.innerHTML = `
          <button class="ui button negative add-to-cart-btn" type="button">${isInSpanish ? "Agregar al carrito" : "Add to cart"}</button>
      `;

      // Agregar comportamiento dinámico
      tacoSelect.addEventListener("change", () => updateSizeOptions(sizeSelect, productData?.variations, tacoSelect.value));
      sizeSelect.addEventListener("change", () => updateTacoOptions(tacoSelect, productData?.variations, sizeSelect.value));

      // Agregar todo al contenedor principal
      const productDetailsSection = document.querySelector(".product-detail-section");
      productDetailsSection.innerHTML = ''; //lo limpio
      if (productDetailsSection) {
          productDetailsSection.appendChild(breadcrumb);
          productDetailsSection.appendChild(productName);
          productDetailsSection.appendChild(productPrice);
          productDetailsSection.appendChild(productDescription);
          productDetailsSection.appendChild(selectsWrapper);
          productDetailsSection.appendChild(buttonContainer);
      }
    }
    productDetailExportObj.paintRelatedProductCards = function() {
      const relatedProductCardWrapper = document.querySelector('.product-cards-wrapper');
      relatedProductCardWrapper.innerHTML = '';
      let productsToPaint = [...productsFromDB];
      
      // Filtrar el array para excluir el producto con el mismo id y devuelve solo los primeros 3 elementos
      productsToPaint = productsFromDB.filter(product => product.id !== productId).slice(0, 3);    
      productsToPaint.forEach( prod =>{
        productCard(prod,'product-cards-wrapper');
      });
    }
    productId = getProductIdFromUrl(); //Obtengo el id del producto   
    await setProductsFromDB({id: productId}); //Seteo el producto
    const productFromDB = productsFromDB?.length && productsFromDB[0] || null;
    if(!productFromDB)return window.location.href = '/tienda'; //Lo mando a la tienda si no encontro
    let productCategoryID = productFromDB?.category?.id
    await setProductsFromDB({categoryId : productCategoryID, limit: 4}); //Aca seteo los products fromDB
    document.title = isInSpanish ? `Tienda - ${productFromDB.es_name}` : `Store - ${productFromDB.eng_name}`;
    // Una vez que esta despintp y pinto
    // hidePlaceHolders();
    createImagesContainer(productFromDB?.files);
    checkForImageClick();
    productsFromDB.length && productDetailExportObj.paintRelatedProductCards(); //Pinto los related
    productDetailExportObj.createProductDetailsSection(productFromDB);
    scrollToTop();
    checkForAddToCartBtnClicks();
    //Hago el pedido al fetch de 4 productos y filtrar 3

    function getProductIdFromUrl() {
      const currentUrl = window.location.pathname; // Obtiene el path de la URL
      const segments = currentUrl.split('/'); // Divide el path en segmentos
      return segments[segments.length - 1]; // Retorna el último segmento (el product id)
    }
    function createImagesContainer(productFiles) {
      const imagesWrapper = document.createElement("div");
      imagesWrapper.className = "images-wrapper";
  
      const smallImagesContainer = document.createElement("div");
      smallImagesContainer.className = "small-images-container tablet-only";
  
      productFiles.forEach((file, index) => {
          // Crear imagen grande
          const largeImage = document.createElement("img");
          largeImage.srcset = file.file_urls
              .map((url) => `${url.url} ${url.size}`)
              .join(", ");
          largeImage.src = file.file_urls[file.file_urls.length - 1].url;
          largeImage.alt = file.filename;
          largeImage.className = `image-element ${index === 0 ? "image-element-active" : ""}`;
          largeImage.setAttribute("data-file_id", file.id);
          largeImage.loading = "lazy";
          imagesWrapper.appendChild(largeImage);
  
          if (productFiles.length > 1) {
              // Crear imagen pequeña
              const smallImage = document.createElement("img");
              smallImage.srcset = file.file_urls
                  .map((url) => `${url.url} ${url.size}`)
                  .join(", ");
              smallImage.src = file.file_urls[file.file_urls.length - 1].url;
              smallImage.alt = file.filename;
              smallImage.className = "small-image-element";
              smallImage.setAttribute("data-file_id", file.id);
              smallImage.loading = "lazy";
              smallImagesContainer.appendChild(smallImage);
          }
      });
  
      // Asegurar que el contenedor comience en la primera imagen
      setTimeout(() => {
          if (imagesWrapper.firstChild) {
              imagesWrapper.firstChild.scrollIntoView({
                  behavior: "auto", // Cambiar a "smooth" si deseas animación
                  block: "nearest",
                  inline: "start",
              });
          }
      }, 0);
  
      // Agregar a la sección product-images-section
      const productImagesSection = document.querySelector(".product-images-section");
      productImagesSection.innerHTML = ''; //lo limpio
      if (productImagesSection) {
          productImagesSection.appendChild(imagesWrapper);
          productImagesSection.appendChild(smallImagesContainer);
      }
  }
  
    // Función para actualizar las opciones de talles
    function updateSizeOptions(sizeSelect, variations, selectedTacoId) {
        const availableSizes = variations
            .filter((v) => v.taco.id == selectedTacoId)
            .map((v) => v.size);
        const uniqueSizes = [...new Map(availableSizes.map((size) => [size.id, size])).values()];

        sizeSelect.innerHTML = uniqueSizes
            .map((size) => `<option value="${size.id}">${size.size}</option>`)
            .join("");
    }

    // Función para actualizar las opciones de tacos
    function updateTacoOptions(tacoSelect, variations, selectedSizeId) {
        const availableTacos = variations
            .filter((v) => v.size.id == selectedSizeId)
            .map((v) => v.taco);
        const uniqueTacos = [...new Map(availableTacos.map((taco) => [taco.id, taco])).values()];

        tacoSelect.innerHTML = uniqueTacos
            .map((taco) => `<option value="${taco.id}">${taco.name}</option>`)
        


      
    }
    //Se fija y setea la imagen principal
    function checkForImageClick() {
      const smallImages = Array.from(document.querySelectorAll('.small-image-element'));
      const bigImages = Array.from(document.querySelectorAll('.image-element'));
      const bigActiveImage = document.querySelector('.image-element.image-element-active');
  
      smallImages.forEach((img, index) => {
          img.addEventListener('click', () => {
              // Obtener la bigImage correspondiente
              const correspondingBigImage = bigImages[index];
              // Verificar si ya está activa
              if (correspondingBigImage.classList.contains('image-element-active')) {
                  return; // Salir si es la misma imagen activa
              }
  
              // Remover la clase active de la imagen actual
              bigImages.forEach(image => image.classList.remove('image-element-active'));
  
              // Agregar la clase active a la nueva imagen seleccionada
              correspondingBigImage.classList.add('image-element-active');
          });
      });
  }
    async function handleAddProductToCart(){
      const size = document.getElementById('size-id').value;
      const taco = document.getElementById('taco-id').value;
      
      const variationFromDB = productFromDB.variations?.find(variation => variation.size?.id == size && variation.taco?.id == taco);
      
      const cartObject = {
        variation_id: variationFromDB.id,
        quantity: 1
      }
      if(userLogged !== null) {
        cartObject.user_id = userLogged.id
        await fetch(`/api/cart/${userLogged.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cartObject)
        })
      } else {
        //Aca seteo un cartItemID para aca
        cartObject.id = generateRandomString(10)
        setLocalStorageItem('cartItems', cartObject, true);
      }
    }
    async function checkForAddToCartBtnClicks(){
      const addToCartBtn = document.querySelector('.add-to-cart-btn');
      addToCartBtn.addEventListener('click', async () => {
        addToCartBtn.classList.add('loading');
        await handleAddProductToCart(addToCartBtn);
        addToCartBtn.classList.remove('loading');
      })
    }
}   
   catch (error) {
    console.log("falle");
    return console.log(error);
  }
});







export {productDetailExportObj};