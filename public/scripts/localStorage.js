export const getLocalStorageItem = (key) => {
    return JSON.parse(localStorage.getItem(key));
};

export function setLocalStorageItem(keyName, dataToSave, isArray = false) {
    if (!isArray) {
      // Si no es array, simplemente lo guardo
      return localStorage.setItem(keyName, JSON.stringify(dataToSave));
    }
  
    // Aquí quiere agregarlo en forma de array
    const existingData = localStorage.getItem(keyName)
      ? JSON.parse(localStorage.getItem(keyName))
      : [];
    
    // Agregar el nuevo objeto al array
    existingData.push(dataToSave);
  
    // Guardar el array actualizado en localStorage
    localStorage.setItem(keyName, JSON.stringify(existingData));
    return;
  }

export const deleteLocalStorageItem = (key) => {
    localStorage.removeItem(key);
}