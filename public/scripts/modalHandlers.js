import { setLocalStorageItem } from "./localStorage.js";
import { buildAddressBodyData, buildPhoneBodyData, buildUserLoginBodyData, buildUserSignUpBodyData, handleAddressCreateFetch, handleModalCreation, handlePhoneCreateFetch, handleUserLoginFetch, handleUserSignUpFetch, updateAddressElements, updatePhoneElements } from "./utils.js";

export async function handlePhoneCreateModal(){
try {
    await handleModalCreation({
        entityType: 'phone',
        buildBodyData: buildPhoneBodyData,
        saveGuestEntity: (bodyData) => setLocalStorageItem("guestPhones", bodyData,  true), //El true es porque es array
        updateElements: updatePhoneElements, // Funcion que actualiza el select de phones,
        postToDatabase: handlePhoneCreateFetch
      })//hago el fetch para crear ese telefono
} catch (error) {
    return console.log(error);
}
}

export async function handleUserLoginModal(){
try {
    await handleModalCreation({
        entityType: 'user',
        buildBodyData: buildUserLoginBodyData,
        postToDatabase: handleUserLoginFetch
      })//hago el fetch para crear ese telefono
} catch (error) {
    return console.log(error);
}
}
export async function handleUserSignUpModal(){
try {
    await handleModalCreation({
        entityType: 'user',
        buildBodyData: buildUserSignUpBodyData,
        postToDatabase: handleUserSignUpFetch
      })//hago el fetch para crear ese telefono
} catch (error) {
    return console.log(error);
}
}

export async function handleAddressCreateModal(){
try {
    await handleModalCreation({
        entityType: 'address',
        buildBodyData: buildAddressBodyData,
        saveGuestEntity: (bodyData) => setLocalStorageItem("guestAddresses", bodyData, true), //El true es porque es array
        updateElements: updateAddressElements, // Funcion que actualiza el select de phones
        postToDatabase: handleAddressCreateFetch
      })//hago el fetch para crear esa address
} catch (error) {
    return console.log(error);
}
}


