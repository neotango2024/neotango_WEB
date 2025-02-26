import { productCard } from "./componentRenderer.js";
import { isInSpanish } from "./languageHandler.js";
import {
  productsFromDB,
  setProductsFromDB,
  scrollToTop,
  generateRandomString,
  variationsFromDB,
  fetchDBProducts,
  minDecimalPlaces,
  displayBigNumbers,
  scriptInitiator,
} from "./utils.js";

let productDetailExportObj = {
  createProductDetailsSection: null,
  paintRelatedProductCards: null,
};
import {
  deleteLocalStorageItem,
  getLocalStorageItem,
  setLocalStorageItem,
} from "./localStorage.js";
import { userLogged } from "./checkForUserLogged.js";
import { checkCartItemsToPaintQuantity } from "./header.js";

let productId, variationSelected;

window.addEventListener("load", async () => {
  try {
    if (!window.location.pathname.includes("/producto/")) return;
     await scriptInitiator(); //Inicio userLogged y lo del lenguaje
    productDetailExportObj.createProductDetailsSection = function (
      productData
    ) {
      const breadcrumb = document.createElement("div");
      breadcrumb.className = "ui breadcrumb";
      breadcrumb.innerHTML = `
          <a class="section" href="/">Home</a>
          <div class="divider"> / </div>
          <a class="section" href="/categoria/${productData?.category?.id}">${
        isInSpanish
          ? productData?.category?.name?.es
          : productData?.category?.name?.en
      }</a>
          <div class="divider"> / </div>
          <div class="active section">${
            isInSpanish ? productData?.es_name : productData?.eng_name
          }</div>
      `;

      const productName = document.createElement("h1");
      productName.className = "product-name";
      productName.textContent = isInSpanish
        ? productData?.es_name
        : productData?.eng_name;

      const productPrice = document.createElement("p");
      productPrice.className = "product-price";
      productPrice.textContent = `$${
        isInSpanish ? displayBigNumbers(minDecimalPlaces(productData?.ars_price)) : displayBigNumbers(minDecimalPlaces(productData?.usd_price))
      }`;

      const productDescription = document.createElement("p");
      productDescription.className = "product-desc";
      productDescription.textContent = isInSpanish
        ? productData?.spanish_description
        : productData?.english_description;

      const selectsWrapper = document.createElement("div");
      selectsWrapper.className = "selects-wrapper";

      // Obtener tacos y talles únicos desde variations
      const tacos = [
        ...new Map(
          productData?.variations.map((v) => [v.taco.id, v.taco])
        ).values(),
      ];
      const sizes = [
        ...new Map(
          productData?.variations.map((v) => [v.size.id, v.size])
        ).values(),
      ];

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
          <label for="size-id">${isInSpanish ? "Talle" : "Size"}</label>
      `;
      sizeSelectContainer.appendChild(sizeSelect);

      selectsWrapper.appendChild(tacoSelectContainer);
      selectsWrapper.appendChild(sizeSelectContainer);

      
      // Agregar comportamiento dinámico
      tacoSelect.addEventListener("change", () => {
        updateSizeOptions(
          sizeSelect,
          productData?.variations,
          tacoSelect.value
        );
        setVariationSelected();
      });
      sizeSelect.addEventListener("change", () => {
        setVariationSelected();
      });
  
      // Agregar todo al contenedor principal
      const productDetailsSection = document.querySelector(
        ".product-detail-section"
      );
      productDetailsSection.innerHTML = ""; //lo limpio
      if (productDetailsSection) {
        productDetailsSection.appendChild(breadcrumb);
        productDetailsSection.appendChild(productName);
        productDetailsSection.appendChild(productPrice);
        productDetailsSection.appendChild(productDescription);
        productDetailsSection.appendChild(selectsWrapper);
        tacoSelect.dispatchEvent(new Event("change")); //Lo pongo despues de agrear al dom
      };

      // Ahora como uktimo agrego el boton
      
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";
      if (productDetailsSection) productDetailsSection.appendChild(buttonContainer);
      paintAddToCartButton();
    };
    
    productId = getProductIdFromUrl(); //Obtengo el id del producto
    await setProductsFromDB({ id: productId }); //Seteo el producto
   
    const productFromDB = (productsFromDB?.length && productsFromDB[0]) || null;
    if (!productFromDB) return (window.location.href = "/tienda"); //Lo mando a la tienda si no encontro
    let productCategoryID = productFromDB?.category?.id;
    const relatedProducts = await fetchDBProducts({ categoryId: productCategoryID, limit: 4 }); //Aca seteo los related
    
    document.title = isInSpanish
      ? `Tienda - ${productFromDB.es_name}`
      : `Store - ${productFromDB.eng_name}`;
    // Una vez que esta despintp y pinto
    // hidePlaceHolders();
    createImagesContainer(productFromDB?.files);
    checkForImageClick();
    productDetailExportObj.paintRelatedProductCards = function () {
      const relatedProductCardWrapper = document.querySelector(
        ".related-products-section .product-cards-wrapper"
      );
      relatedProductCardWrapper.innerHTML = "";
      let productsToPaint = [...relatedProducts];

      // Filtrar el array para excluir el producto con el mismo id y devuelve solo los primeros 3 elementos
      productsToPaint = productsToPaint
        .filter((product) => product.id !== productId)
        .slice(0, 3);
      productsToPaint.forEach((prod) => {
        let cardElement = productCard(prod);
        relatedProductCardWrapper.appendChild(cardElement)
      });
    };
    productDetailExportObj.createProductDetailsSection(productFromDB);
    relatedProducts.length && productDetailExportObj.paintRelatedProductCards(); //Pinto los related
    scrollToTop();
    //Hago el pedido al fetch de 4 productos y filtrar 3

    function getProductIdFromUrl() {
      const currentUrl = window.location.pathname; // Obtiene el path de la URL
      const segments = currentUrl.split("/"); // Divide el path en segmentos
      return segments[segments.length - 1]; // Retorna el último segmento (el product id)
    }
    function createImagesContainer(productFiles) {
      const imagesWrapper = document.createElement("div");
      imagesWrapper.className = "images-wrapper";

      // const smallImagesContainer = document.createElement("div");
      // smallImagesContainer.className = "small-images-container tablet-only";

      productFiles.forEach((file, index) => {
        // Crear imagen grande
        const largeImage = document.createElement("img");
        largeImage.srcset = file.file_urls
          .map((url) => `${url.url} ${url.size}`)
          .join(", ");
        largeImage.src = file.file_urls[file.file_urls.length - 1].url;
        largeImage.alt = file.filename;
        largeImage.className = `image-element ${
          index === 0 ? "image-element-active" : ""
        }`;
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
          //smallImagesContainer.appendChild(smallImage);
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
      const productImagesSection = document.querySelector(
        ".product-images-section"
      );
      productImagesSection.innerHTML = ""; //lo limpio
      if (productImagesSection) {
        productImagesSection.appendChild(imagesWrapper);
        //productImagesSection.appendChild(smallImagesContainer);
      }
    }

    // Función para actualizar las opciones de talles
    function updateSizeOptions(sizeSelect, variations, selectedTacoId) {
      const availableSizes = variations
        .filter((v) => v.taco.id == selectedTacoId)
        .map((v) => v.size);
      const uniqueSizes = [
        ...new Map(availableSizes.map((size) => [size.id, size])).values(),
      ];

      sizeSelect.innerHTML = uniqueSizes
        .map((size) => `<option value="${size.id}">${size.size}</option>`)
        .join("");
    }

    //Se fija y setea la imagen principal
    function checkForImageClick() {
      const smallImages = Array.from(
        document.querySelectorAll(".small-image-element")
      );
      const bigImages = Array.from(document.querySelectorAll(".image-element"));
      const bigActiveImage = document.querySelector(
        ".image-element.image-element-active"
      );

      smallImages.forEach((img, index) => {
        img.addEventListener("click", () => {
          // Obtener la bigImage correspondiente
          const correspondingBigImage = bigImages[index];
          // Verificar si ya está activa
          if (
            correspondingBigImage.classList.contains("image-element-active")
          ) {
            return; // Salir si es la misma imagen activa
          }

          // Remover la clase active de la imagen actual
          bigImages.forEach((image) =>
            image.classList.remove("image-element-active")
          );

          // Agregar la clase active a la nueva imagen seleccionada
          correspondingBigImage.classList.add("image-element-active");
        });
      });
    }
    async function handleAddProductToCart() {
      const cartObject = {
        variation_id: variationSelected.id,
        quantity: 1,
      };
      
      if (userLogged !== null) {
        cartObject.user_id = userLogged.id;
        let response = await fetch(`/api/cart/${userLogged.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cartObject),
        });
        if(response.ok){
          userLogged.tempCartItems?.push(cartObject);
        }
      } else {
        //Aca seteo un cartItemID para aca
        cartObject.id = generateRandomString(10);
        setLocalStorageItem("cartItems", cartObject, true);
      }
      checkCartItemsToPaintQuantity();
      // Antes de retornar pinto nuevamente el boton
      paintAddToCartButton();
      return
    }
    async function checkForAddToCartBtnClicks() {
      const addToCartBtn = document.querySelector(".add-to-cart-btn");
      addToCartBtn.addEventListener("click", async () => {
        addToCartBtn.classList.add("loading");
        await handleAddProductToCart(addToCartBtn);
        addToCartBtn.classList.remove("loading");
      });
    }
    function checkForVariationStock(){
      return variationSelected.quantity > 0;
      ;
    }
    function checkForProductInCart() {
      let cartItems;
      if (!userLogged) {
        cartItems = getLocalStorageItem("cartItems") || [];
      } else {
        cartItems = userLogged.tempCartItems || [];
      }

      const variationIsInCartIndex = cartItems.findIndex(
        (item) => item.variation_id == variationSelected.id
      );
      if (variationIsInCartIndex < 0) return false;
      return true;
    }
    //
    function setVariationSelected() {
      const tacoSelect = document.querySelector('select[name="taco-id"]');
      const sizeSelect = document.querySelector('select[name="size-id"]');

      const productVariations = productFromDB.variations;
      variationSelected = productVariations.find(
        (variation) =>
          variation.taco.id == tacoSelect.value &&
          variation.size.id == sizeSelect.value
      );
      paintAddToCartButton(); //Pinta el boton
    };
    //Pinta el boton dependiendo si la variacion elegida esta o no en el carro
    function paintAddToCartButton(){
      const button = document.querySelector('.button-container');
      if(!button)return
      const variationHasStock = checkForVariationStock();
      if(!variationHasStock){
        const buttonText = isInSpanish
          ? "Producto sin stock"
        : "Out of stock";
      button.innerHTML = `
          <button class="ui button negative basic add-to-cart-btn disabled" type="button">${buttonText}</button>
      `;
      return
      }
      
      const productAlreadyInCart = checkForProductInCart(); //Se fija si la variacion ya esta en el carro
      const buttonText = productAlreadyInCart
        ? isInSpanish
          ? "Agregado al carro"
        : "In cart"
        : isInSpanish
        ? "Agregar al carrito"
          : "Add to cart";
      button.innerHTML = `
          <button class="ui button negative add-to-cart-btn ${
            productAlreadyInCart ? "disabled" : ""
          }" type="button">${buttonText}</button>
      `;
      checkForAddToCartBtnClicks();
    }
  } catch (error) {
    console.log("falle");
    return console.log(error);
  }
});

export { productDetailExportObj };
