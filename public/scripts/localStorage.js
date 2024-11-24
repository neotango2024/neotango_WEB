export const getItem = (key) => {
    return localStorage.getItem(key);
};

export const setItem = (key, value) => {
    localStorage.setItem(key, value);
};

export const deleteItem = (key, value) => {
    localStorage.removeItem(key);
}