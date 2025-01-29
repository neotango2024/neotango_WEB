import { userLogged } from "./checkForUserLogged.js";
import {
  addressCard,
  checkoutCard,
  createAddressModal,
  createUserMenuBtn,
  form,
  orderCard,
  phoneCard,
  userInfoComponent,
} from "./componentRenderer.js";
import { gendersFromDB, setGenders } from "./getStaticTypesFromDB.js";
import { isInSpanish } from "./languageHandler.js";
import {
  handleNewAddressButtonClick,
  handleNewPhoneButtonClick,
  productsFromDB,
  setProductsFromDB,
  showCardMessage,
} from "./utils.js";

let activeIndexSelected = 0; //index del array "items"
let typeOfPanel = 1; //Admin 1 | User 2 TODO: CHequear por el tipo de usuario al recargar
let userProfileExportObj = {
  pageConstructor: null,
};

window.addEventListener("load", async () => {
  const { pathname, search } = window.location;
  if (!pathname.endsWith("/perfil")) return;
  //si no hay user logged lo manda a la home
  if (!userLogged) return (window.location.href = "/");
  typeOfPanel = userLogged.user_role_id;

  // Obtén el parámetro `index` de la URL
  const urlParams = new URLSearchParams(search);
  const indexFromURL = urlParams.get("index");
  // Si existe el parámetro, actualiza `activeIndexSelected`
  // esto es por si toca desde el dropdown
  if (indexFromURL !== null) {
    activeIndexSelected = parseInt(indexFromURL, 10); //El 10 es por algo tecnico del parseInt
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
          typeOfPanel == 2 ? paintUserProfile() : paintAdminSales(); //TODO: Armar para admin las sales
          break;
        case 1: //Addresses | Products
          typeOfPanel == 2 ? paintUserAddresses() : paintAdminProducts(); //TODO: Armar para admin los products
          break;
        case 2: //Phones | shippings
          typeOfPanel == 2 ? paintUserPhones() : paintAdminShippings(); //TODO: Armar para admin los envios
          break;
        case 3: //Order History | ??
          typeOfPanel == 2 ? await paintUserOrders() : null;
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
          itemType: "profile", // Identificador
          itemLogo: "bx bx-user-circle", // Clase CSS para el ícono
          itemLabel: isInSpanish ? "Perfil" : "Profile", // Texto del tooltip
        },
        //TODO: poner las opciones del admin. LOGOUT NO
      ],
      actualIndexSelected: activeIndexSelected, //Esto basicamente es para saber cual item renderizar activo
    };
    const previousMenuBtn = main.querySelector(".dropdown.user-menu-btn");
    if (previousMenuBtn) previousMenuBtn.remove(); //Lo borro
    const menuBtn = createUserMenuBtn(userProps);
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
      emptyPhoneCard.addEventListener("click", () => handleNewPhoneButtonClick());
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
      paintUserProfile();
      return;
    }
    let msg = isInSpanish
      ? "Ha ocuriddo un error inesperado, intente nuevamente"
      : "There was an unexpected error, please try again";
    showCardMessage(false, msg);
    return;
  }
});

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
export { userProfileExportObj };
