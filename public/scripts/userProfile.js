import { userLogged } from "./checkForUserLogged.js";
import {
  addressCard,
  button,
  checkoutCard,
  closeModal,
  createAddressModal,
  createLoadingSpinner,
  createProductModal,
  createUserMenuBtn,
  destroyExistingModal,
  form,
  generateOrderDetailModal,
  orderCard,
  phoneCard,
  userInfoComponent,
} from "./componentRenderer.js";
import {
  gendersFromDB,
  getOrderStatuses,
  setGenders,
} from "./getStaticTypesFromDB.js";
import { paintUserIconOrLetter } from "./header.js";
import { isInSpanish } from "./languageHandler.js";
import {
  handleNewAddressButtonClick,
  handleNewPhoneButtonClick,
  productsFromDB,
  sanitizeDate,
  setProductsFromDB,
  setOrdersFromDb,
  showCardMessage,
  ordersFromDb,
  handlePageModal,
  setShippingZones,
  shippingZones,
  handleUpdateZonePrices
} from "./utils.js";

let activeIndexSelected = 0; //index del array "items"
let typeOfPanel; //Admin 1 | User 2 
let userProfileExportObj = {
  pageConstructor: null,
};

window.addEventListener("load", async () => {
  const { pathname } = window.location;
  if (!pathname.endsWith("/perfil")) return;
  if (!userLogged) return (window.location.href = "/");
  typeOfPanel = userLogged.user_role_id;
  const orderStatuses = await getOrderStatuses();
  // Obtén el parámetro `index` de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const indexFromURL = urlParams.get("index");
  // Si existe el parámetro, actualiza `activeIndexSelected`
  // esto es por si toca desde el dropdown
  if (indexFromURL !== null) {
    activeIndexSelected = parseInt(indexFromURL, 10); //El 10 es por algo tecnico del parseInt
  }
  if (typeOfPanel === 1) {
    await setProductsFromDB();
    await setOrdersFromDb();
    await setShippingZones();
  }
  let userOrders = [];
  // return
  await setGenders(); //Setea el genero
  const main = document.querySelector(".main");
  const mainContentWrapper = document.querySelector(".main-content-wrapper");
  // Para los labels
  //Esta funcion chequea el click de lo que se toque en menu
  function handleUserMenuSection() {
    const anchorItemsFromMenu = Array.from(
      document.querySelectorAll(".main .user-menu-btn .item")
    );
    const menuBtn = document.querySelector(".main .user-menu-btn>i");
    for (const anchor of anchorItemsFromMenu) {
      if (anchor.dataset.listened) return;
      anchor.dataset.listened = true;

      anchor.addEventListener("click", async () => {
        let iconClass = anchor.querySelector("i")?.className;
        menuBtn.className = iconClass;
        const anchorIndex = anchor.dataset.index;
        if (activeIndexSelected != anchorIndex) {
          // Aca esta tocando otro
          activeIndexSelected = parseInt(anchor.dataset.index);
          await contentConstructorHandler();
        }
      });
    }
  }

  userProfileExportObj.pageConstructor = async function () {
    const placeholders = document.querySelectorAll(".placeholder");
    placeholders?.forEach((element) => element.remove());
    menuBtnConstructor(); //Pinto las opciones
    await contentConstructorHandler();
  };
  
  userProfileExportObj.pageConstructor();

  //Esta funcion define que pintar (dependiendo que esta seleccionado, y si es admin/user)
  async function contentConstructorHandler() {
    try {
      //Despinto el wrapper
      mainContentWrapper.innerHTML = "";
      //esta funcion dependiendo que viene invoca a la funcion que pinta/despinta las cosas
      switch (activeIndexSelected) {
        case 0: //Profile | Ventas
          typeOfPanel === 2
            ? paintUserProfile()
            : paintAdminSales(orderStatuses);
          break;
        case 1: //Addresses | Products
          typeOfPanel === 2 ? paintUserAddresses() : paintAdminProducts();
          break;
        case 2: //Phones | shippings
          typeOfPanel === 2 ? paintUserPhones() : paintAdminShippings(); 
          break;
        case 3: //Order History | ??
          typeOfPanel === 2 ? paintUserOrders() : null;
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("Falle");
      return console.log(error);
    }
  }
  //Construye el menu
  function menuBtnConstructor() {
    const userProps = {
      type: typeOfPanel, // User panel
      items: [
        {
          itemType: "profile", // Identificador
          itemLogo: "bx bx-user-circle", // Clase CSS para el ícono
          itemLabel: isInSpanish ? "Perfil" : "Profile", // Texto del tooltip
        },
        {
          itemType: "address",
          itemLogo: "bx bx-map",
          itemLabel: isInSpanish ? "Mis Direcciones" : "My Addresses",
        },
        {
          itemType: "phones",
          itemLogo: "bx bx-phone",
          itemLabel: isInSpanish ? "Mis Telefonos" : "My Phones",
        },
        {
          itemType: "orderHistory",
          itemLogo: "bx bx-spreadsheet",
          itemLabel: isInSpanish ? "Historial de Compras" : "Order History",
        },
      ],
      actualIndexSelected: activeIndexSelected, //Esto basicamente es para saber cual item renderizar activo
    };
    //Para los labels
    const adminProps = {
      type: typeOfPanel, //Admin panel
      items: [
        {
          itemType: "sales", // Identificador
          itemLogo: "bx bx-money-withdraw", // Clase CSS para el ícono
          itemLabel: "Ventas", // Texto del tooltip
        },
        {
          itemType: "products", // Identificador
          itemLogo: "bx bxs-tag", // Clase CSS para el ícono
          itemLabel: "Productos", // Texto del tooltip
        },
        {
          itemType: "shipping", // Identificador
          itemLogo: "bx bxs-truck", // Clase CSS para el ícono
          itemLabel: "Envíos", // Texto del tooltip
        },
      ],
      actualIndexSelected: activeIndexSelected, //Esto basicamente es para saber cual item renderizar activo
    };
    const checkedProps = typeOfPanel === 2 ? userProps : adminProps;
    const previousMenuBtn = main.querySelector(".dropdown.user-menu-btn");
    if (previousMenuBtn) previousMenuBtn.remove(); //Lo borro
    const menuBtn = createUserMenuBtn(checkedProps);
    // Insertar el botón antes de mainContentWrapper
    main.insertBefore(menuBtn, mainContentWrapper);
    handleUserMenuSection();
    // ACtivo el dropdown
    $(".ui.dropdown.user-menu-btn").dropdown({
      direction: "upward",
      keepOnScreen: true,
      context: window,
    });
  }
  //FUNCINONES PARA PINTAR EL HTML DEL USER PANEL
  function paintUserProfile() {
    const { userInfoComponentElement, userForm } = createUserProfileComponent();
    //le seteo las clases
    mainContentWrapper.className = "main-content-wrapper user-info-wrapper";
    mainContentWrapper.appendChild(userInfoComponentElement);
    mainContentWrapper.appendChild(userForm);
  }
  function paintUserAddresses() {
    let addressesToPaint = userLogged?.addresses;
    //le seteo las clases
    mainContentWrapper.className = "main-content-wrapper address-wrapper";
    if (userLogged?.addresses.length < 4) {
      //Agrego la tarjeta para agregar
      const emptyAddressCard = addressCard(undefined);
      mainContentWrapper.appendChild(emptyAddressCard);
      // Agregar el evento al hacer clic
      emptyAddressCard.addEventListener("click", () =>
        handleNewAddressButtonClick()
      );
    }

    for (const address of addressesToPaint) {
      // Crear y agregar la tarjeta de dirección
      const addressElement = addressCard(address);
      mainContentWrapper.appendChild(addressElement);
    }
  }
  function paintUserPhones() {
    let phonesToPaint = userLogged?.phones;
    //le seteo las clases
    mainContentWrapper.className = "main-content-wrapper phones-wrapper";
    if (phonesToPaint.length < 3) {
      //Agrego la tarjeta para agregar
      const emptyPhoneCard = phoneCard(undefined);
      mainContentWrapper.appendChild(emptyPhoneCard);
      // Agregar el evento al hacer clic
      emptyPhoneCard.addEventListener("click", () =>
        handleNewPhoneButtonClick()
      );
    }
    for (const address of phonesToPaint) {
      // Crear y agregar la tarjeta de dirección
      const phoneElement = phoneCard(address);
      mainContentWrapper.appendChild(phoneElement);
    }
  }
  async function paintUserOrders() {
    //le seteo las clases
    mainContentWrapper.className = "main-content-wrapper user-orders-wrapper";
    //Recien aca cargo las ordenes
    if (!userOrders.length) userOrders = await getUserOrders();
    userOrders.forEach((order) => {
      const orderCardElement = orderCard(order);
      orderCardElement.addEventListener('click',()=>{
        let orderModalElement = generateOrderDetailModal(order);
        document.body.appendChild(orderModalElement);
        handlePageModal(true);
      })
      mainContentWrapper.appendChild(orderCardElement);
    });
  }
  function createUserProfileComponent() {
    const userInfoComponentElement = userInfoComponent(userLogged);

    let genderOptions = gendersFromDB.map((gender) => ({
      value: gender.id,
      label: isInSpanish ? gender.es : gender.en,
      selected: gender.id == userLogged.gender_id,
    }));
    const userFormProps = {
      formAction: "/api/user", // Acción del formulario
      method: "PUT", // Método del formulario
      formClasses: "user-info-form",
      inputProps: [
        {
          type: "text",
          name: "first_name",
          placeholder: isInSpanish ? "Nombre" : "First Name",
          label: isInSpanish ? "Nombre" : "First Name",
          required: true,
          value: userLogged.first_name || "",
          width: 45, // El ancho del campo en porcentaje
          contClassNames: "first-name-container", // Clases adicionales para el contenedor
        },
        {
          type: "text",
          name: "last_name",
          placeholder: isInSpanish ? "Apellido" : "Enter Last Name",
          label: isInSpanish ? "Apellido" : "Last Name",
          required: true,
          width: 45,
          value: userLogged.last_name || "",
          contClassNames: "last-name-container",
        },
        {
          type: "select",
          name: "gender_id",
          label: isInSpanish ? "Genero" : "Gender",
          required: true,
          options: genderOptions,
          width: 100,
          contClassNames: "gender-container",
        },
      ],
      buttonProps: [
        {
          type: "button",
          className: "negative send-form-btn",
          text: isInSpanish ? "Actualizar" : "Update",
          onClick: async () => await handleUserUpdateFetch(),
        },
      ],
    };
    const userForm = form(userFormProps);
    return { userInfoComponentElement, userForm };
  }
  async function handleUserUpdateFetch() {
    const bodyData = {};
    const form = document.querySelector(".form-container .user-info-form");
    const sendButton = form.querySelector(".send-form-btn");
    bodyData.first_name = form.first_name?.value;
    bodyData.last_name = form.last_name?.value;
    bodyData.gender_id = form.gender_id?.value;
    bodyData.user_id = userLogged.id;
    sendButton.classList.add("loading");
    let response = await fetch("/api/user/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });
    sendButton.classList.remove("loading");
    if (response.ok) {
      response = response.ok ? await response.json() : null;
      //Esta es la respuesta de las credenciales
      //Aca dio ok, entonces al ser de un usuario actualizo al usuarioLogged.phones
      userLogged.first_name = bodyData.first_name;
      userLogged.last_name = bodyData.last_name;
      userLogged.gender_id = bodyData.gender_id;
      showCardMessage(true, isInSpanish ? response.msg.es : response.msg.en);
      mainContentWrapper.innerHTML = "";
      paintUserProfile();
      paintUserIconOrLetter(); //Esto es para que cambie las inciiales
      return;
    }
    let msg = isInSpanish
      ? "Ha ocuriddo un error inesperado, intente nuevamente"
      : "There was an unexpected error, please try again";
    showCardMessage(false, msg);
    return;
  }
});

const orderLimit = 8;
let offset = 0;

const paintAdminSales = async (orderStatuses) => {
  const mainWrapper = document.querySelector(".main-content-wrapper");
  const h1Element = document.createElement("h1");
  h1Element.className = "page-title red";
  h1Element.textContent = "Ventas";
  mainWrapper.appendChild(h1Element);
  const h3SummaryElement = document.createElement("h3");
  h3SummaryElement.className = "red title-description ";
  h3SummaryElement.textContent = "Resumen";
  mainWrapper.appendChild(h3SummaryElement);
  const totalPeriodSelect = constructTotalPeriodSelect();
  const selectContainer = document.createElement("div");
  selectContainer.className = "total-select-container";
  selectContainer.appendChild(totalPeriodSelect);
  listenForTotalPeriodSelectChange(totalPeriodSelect);
  mainWrapper.appendChild(selectContainer);
  const totalSalesCashContainer = constructTotalSalesCashSquares();
  mainWrapper.appendChild(totalSalesCashContainer);
  const h3TableElement = document.createElement("h3");
  h3TableElement.className = "red title-description table-h3";
  h3TableElement.textContent = "Tabla de ventas";
  mainWrapper.appendChild(h3TableElement);
  const gridTable = document.createElement("div");
  gridTable.className = "ag-theme-alpine";
  gridTable.id = "myGrid";
  mainWrapper.appendChild(gridTable);
  const rowsData = [];
  ordersFromDb.forEach((order) => {
    const rowObject = {
      identificador: order.tra_id,
      nombre: order.first_name,
      apellido: order.last_name,
      items: order.orderItems.length,
      fecha: sanitizeDate(order.createdAt),
      estado: order.orderStatus.status.es,
    };
    rowsData.push(rowObject);
  });
  const gridData = {
    columnDefs: [
      { field: "identificador", flex: 1, filter: "agTextColumnFilter" },
      { field: "nombre", flex: 0.8, filter: "agTextColumnFilter" },
      { field: "apellido", flex: 1, filter: "agTextColumnFilter" },
      { field: "items", flex: 0.5, filter: "agNumberColumnFilter" },
      { field: "estado", flex: 1, filter: "agTextColumnFilter" },
      { field: "fecha", flex: 0.6, filter: "agDateColumnFilter" },
    ],
    domLayout: "autoHeight",
    onRowClicked: (event) => {
      const order = ordersFromDb.find(
        (order) => order.tra_id === event.data.identificador
      );
      handleOrderRowClick(order, orderStatuses);
    },
  };
  gridData.rowData = rowsData;
  const gridDiv = document.querySelector("#myGrid");
  agGrid.createGrid(gridDiv, gridData);
};

const filterOrdersByDateRange = (orders, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= start && orderDate <= end;
  });
};

const listenForTotalPeriodSelectChange = (selectElement) => {
  selectElement.addEventListener("change", (e) => {
    handleTotalPeriodChange(e.target.value);
  });
};

const handleTotalPeriodChange = (eventValue) => {
  // eventValue sería 7, 15, 30, 90, etc.

  const currentDate = new Date();

  const startDate = new Date(currentDate);
  startDate.setDate(startDate.getDate() - eventValue);

  const filteredOrders = filterOrdersByDateRange(
    ordersFromDb,
    startDate,
    currentDate
  );

  let totalSalesAccumulador = filteredOrders.length;

  const { dolarSalesNumber, pesosSalesNumber } =
    getTotalUsdAndPesosAccumulators(filteredOrders);

  const totalUsdElement = document.querySelector(".usd-total");
  totalUsdElement.textContent = dolarSalesNumber;

  const totalArsElement = document.querySelector(".ars-total");
  totalArsElement.textContent = pesosSalesNumber;

  const totalSalesElement = document.querySelector(".sales-total");
  totalSalesElement.textContent = totalSalesAccumulador;
};

const constructTotalPeriodSelect = () => {
  const select = document.createElement("select");

  const options = [
    { value: "7", text: "Últimos 7 días" },
    { value: "15", text: "Últimos 15 días" },
    { value: "30", text: "Último mes" },
    { value: "90", text: "Últimos 3 meses" },
  ];

  options.forEach((optionData) => {
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    select.appendChild(option);
  });
  return select;
};
const constructTotalSalesCashSquares = () => {
  const totalSalesAndCashContainer = document.createElement("div");
  totalSalesAndCashContainer.className = "total-sales-cash-container";

  const totalCashContainer = document.createElement("div");
  totalCashContainer.className = "total-sales-container";

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const startDate = sevenDaysAgo.toISOString();
  const endDate = today.toISOString();

  const filteredOrders = filterOrdersByDateRange(
    ordersFromDb,
    startDate,
    endDate
  );

  const { dolarSalesNumber, pesosSalesNumber } =
    getTotalUsdAndPesosAccumulators(filteredOrders);

  totalCashContainer.innerHTML = `
    <i class= "bx bx-cart cart-icon"> </i>
    <div class="totals-container">
      <p class="total-label"> <strong class="sales-total">${filteredOrders.length}</strong> ventas </p> 
      <p class="total-label"> USD <strong class="usd-total">${dolarSalesNumber}</strong> </p>
      <p class="total-label"> ARS <strong class="ars-total"> ${pesosSalesNumber}</strong> </p>
    </div>
  `;

  totalSalesAndCashContainer.appendChild(totalCashContainer);

  return totalSalesAndCashContainer;
};

const getTotalUsdAndPesosAccumulators = (orders) => {
  let dolarSalesNumber = 0;
  let pesosSalesNumber = 0;

  orders.forEach((order) => {
    const { currency_id, total } = order;

    if (currency_id === 1) {
      dolarSalesNumber += total;
    } else {
      pesosSalesNumber += total;
    }
  });

  return {
    dolarSalesNumber,
    pesosSalesNumber,
  };
};

const paintAdminProducts = async () => {
  const mainWrapper = document.querySelector(".main-content-wrapper");
  const titleAddProductContainer = document.createElement("div");
  titleAddProductContainer.className = "title-add-product-container";
  titleAddProductContainer.innerHTML = `
        <h1 class="page-title red">Productos</h1>
        <div class="add-product-container">
          <i class='bx bx-plus add-product-icon'></i>
        </div>
  `;
  mainWrapper.appendChild(titleAddProductContainer);
  const gridTable = document.createElement("div");
  gridTable.className = "ag-theme-alpine";
  gridTable.id = "myGrid";
  mainWrapper.appendChild(gridTable);

  const rowsData = [];
  productsFromDB.forEach((prod) => {
    const {id, sku, es_name, category, createdAt, usd_price, ars_price } = prod;
    const rowObject = {
      id,
      sku,
      nombre: es_name,
      categoria: category.name.es,
      dolares: usd_price,
      pesos: ars_price,
      creado: sanitizeDate(createdAt),
    };
    rowsData.push(rowObject);
  });
  const gridData = {
    columnDefs: [
      { field: "sku", flex: 0.8, filter: "agTextColumnFilter" },
      { field: "nombre", flex: 1, filter: "agTextColumnFilter" },
      { field: "categoria", flex: 0.7, filter: "agTextColumnFilter" },
      { field: "dolares", flex: 0.5, filter: "agTextColumnFilter" },
      { field: "pesos", flex: 0.5, filter: "agTextColumnFilter" },
      { field: "creado", flex: 0.4, filter: "agDateColumnFilter" },
    ],
    onRowClicked: (event) => {
      const product = productsFromDB.find(
        (product) => product.id === event.data.id
      );
      handleProductRowClick(product);
    },
  };
  gridData.rowData = rowsData;
  const gridDiv = document.querySelector("#myGrid");
  agGrid.createGrid(gridDiv, gridData);
  // Una vez lo creo, armo las escuchas
  listenToAddProductBtn();
};

const handleProductRowClick = (product) => {
  console.log(product)
}

const handleOrderRowClick = async (order, orderStatuses) => {
  destroyExistingModal();
  const modal = document.createElement("div");
  modal.className = "ui tiny order-modal modal";

  const closeButtonContainer = document.createElement("div");
  closeButtonContainer.className = "close-button-container";
  modal.appendChild(closeButtonContainer);
  const closeBtn = document.createElement("i");
  closeBtn.className = "bx bx-x close-btn";
  closeBtn.onclick = closeModal();
  closeButtonContainer.appendChild(closeBtn);

  // Contenido del modal
  const content = document.createElement("div");
  const {
    tra_id,
    first_name,
    last_name,
    shipping_address_city,
    shipping_address_country_name,
    shipping_address_detail,
    shipping_address_province,
    shipping_address_street,
    shipping_address_zip_code,
    orderItems,
    currency,
    total,
  } = order;
  const loadingSpinner = createLoadingSpinner("hidden");
  content.className = "content";
  content.innerHTML = `
      <h2>Detalle de orden</h2>
      <div class="order-label-text-container">
        <p class="order-label">Identificador de orden</p>
        <p class="order-text"> ${tra_id} </p>
      </div>
      <div class="order-label-text-container">
        <p class="order-label">Cliente</p>
        <p class="order-text"> ${first_name} ${last_name} </p>
      </div>
      <div class="order-label-text-container">
        <p class="order-label">Estado</p>
        <div class="select-loading-container">
          <select id="orderStatusSelect">
          ${orderStatuses
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
        </div>
      </select>
      </div>
      <div class="order-label-text-container">
        <p class="order-label">Envío</p>
        <p class="order-text"> ${shipping_address_street} ${shipping_address_detail} </p>
        <p class="order-text"> ${shipping_address_city} ${shipping_address_province} </p>
        <p class="order-text"> ${shipping_address_zip_code} ${shipping_address_country_name} </p>
      </div>
      <div class="order-label-text-container">
        <p class="order-label">Productos</p>
        ${orderItems
          .map(
            (item) => `
          <p class="order-text"> ${item.es_name} - talle: ${item.size} - taco: ${item.taco} - cantidad: ${item.quantity} - precio unitario ${item.price} </p>  
        `
          )
          .join("")}
      </div>
      <div class="order-label-text-container">
        <p class="order-label">Total</p>
        <p class="order-text"> ${total} ${currency.currency}  </p>
      </div>
  `;

  modal.appendChild(content);

  document.body.appendChild(modal);
  const loadingSelectContainer = document.querySelector(
    ".select-loading-container"
  );
  loadingSelectContainer.appendChild(loadingSpinner);

  addOrderStatusSelectEventListener(order);

  $(modal)
    .modal({
      onHidden: function () {
        removeOrderStatusSelectEventListener();
        modal.remove();
      },
    })
    .modal("show");
};

const handleChangeOrderStatusWrapper = async (e, order) => {
  await handleChangeOrderStatus(e, order);
};

const addOrderStatusSelectEventListener = (order) => {
  const select = document.getElementById("orderStatusSelect");

  // declaramos una propiedad del select como funcion
  select._handleChangeOrderStatusWrapper = (e) =>
    handleChangeOrderStatusWrapper(e, order);

  // al hacer el event listener, el callback es el wrapper
  select.addEventListener("change", select._handleChangeOrderStatusWrapper);
};

const removeOrderStatusSelectEventListener = () => {
  const select = document.getElementById("orderStatusSelect");

  // el select debería tener la propiedad declarada antes
  if (select._handleChangeOrderStatusWrapper) {
    select.removeEventListener(
      "change",
      select._handleChangeOrderStatusWrapper
    );
    delete select._handleChangeOrderStatusWrapper;
  }
};
const handleChangeOrderStatus = async (e, order) => {
  const loadingSpinner = document.querySelector(".loading-state");
  try {
    const newOrderStatus = e.target.value;
    loadingSpinner.classList.remove("hidden");
    const statusResponse = await fetch(`/api/order/order-status/${order.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_status_id: newOrderStatus }),
    });
  } catch (error) {
    // TODO - show result message
  }
  loadingSpinner.classList.add("hidden");
};

const getAllProducts = async () => {
  try {
    const productsResponse = await fetch("/api/product");
    const productsResponseJson = await productsResponse.json();
  } catch (error) {
    // TODO - show result message
  }
};

const getAllOrders = async () => {
  const response = await fetch(
    `/api/order?limit=${orderLimit}&offset=${offset}`
  );
  const data = await response.json();
  return data.orders;
};

async function getUserOrders() {
  let array =
    (
      await (
        await fetch(
          `${window.location.origin}/api/user/order?userLoggedId=${userLogged.id}`
        )
      ).json()
    ).data || [];
  return array;
}

async function listenToAddProductBtn() {
  const addProductBtn = document.querySelector(".add-product-icon");
  if (!addProductBtn.dataset.listened) {
    addProductBtn.dataset.listened = true;
    addProductBtn.addEventListener("click", async () => {
      await createProductModal();
    });
  }
}

const paintAdminShippings = () => {
  const mainWrapper = document.querySelector('.main-content-wrapper');
  if(window.screen.width > 1024){
    mainWrapper.style.alignItems = "flex-start"
  }
  const h1Element = document.createElement('h1');
  h1Element.className = "page-title red";
  h1Element.textContent = "Envíos";
  mainWrapper.appendChild(h1Element)
  const zonesContainer = document.createElement('div');
  zonesContainer.className = "zones-container";
  mainWrapper.appendChild(zonesContainer);

  shippingZones.forEach(zone => {
    const {name, price} = zone;
    const zoneContainer = document.createElement('div');
    zoneContainer.className = 'zone-container';
    zoneContainer.innerHTML = `
      <p class="zone-name red">${name.es}<p>
    `;
    
  const form = document.createElement('form');
  form.className = 'zone-form';

  const usdLabelInputContainer = document.createElement('div');
  usdLabelInputContainer.className = "shipping-label-input-container"
  const labelUSD = document.createElement('label');
  labelUSD.textContent = 'Precio en USD';
  labelUSD.htmlFor = 'usd-price';

  const inputUSD = document.createElement('input');
  inputUSD.type = 'text';
  inputUSD.value = price.usd_price;
  inputUSD.className = 'usd-price-input';
  inputUSD.id = 'usd-price';

  usdLabelInputContainer.appendChild(labelUSD);
  usdLabelInputContainer.appendChild(inputUSD);

  const arsLabelInputContainer = document.createElement('div');
  arsLabelInputContainer.className = "shipping-label-input-container";
  const labelARS = document.createElement('label');
  labelARS.textContent = 'Precio en ARS';
  labelARS.htmlFor = 'ars-price';

  const inputARS = document.createElement('input');
  inputARS.type = 'text';
  inputARS.value = price.ars_price;
  inputARS.className = 'ars-price-input';
  inputARS.id = 'ars-price';

  arsLabelInputContainer.appendChild(labelARS);
  arsLabelInputContainer.appendChild(inputARS);

  const buttonProps = {
    width: 70,
    text: 'Guardar'
  }
  const buttonCreated = button(buttonProps);

  form.appendChild(usdLabelInputContainer);
  form.appendChild(arsLabelInputContainer);
  form.appendChild(buttonCreated);
  form.dataset.zoneId = zone.id;

  zoneContainer.appendChild(form);
  zonesContainer.appendChild(zoneContainer);
  listenForZoneFormSubmit(form);
  })
}

const listenForZoneFormSubmit = (form) => {
  form.addEventListener('submit', async (e) => {
    const zoneId = form.dataset.zoneId;
    e.preventDefault();
    const loadingSpinner = createLoadingSpinner('zone-loading-spinner');
    const button = form.querySelector('button');
    button.style.display = "none";
    form.appendChild(loadingSpinner);
    const usdPriceInputValue = form.querySelector('.usd-price-input').value;
    const arsPriceInputValue = form.querySelector('.ars-price-input').value;
    const pricesObject = {
      usdPriceInputValue,
      arsPriceInputValue
    }
    const okResponse = await handleUpdateZonePrices(pricesObject, zoneId);
    loadingSpinner.remove();
    button.style.display = "block";
  })
}

export { userProfileExportObj };
