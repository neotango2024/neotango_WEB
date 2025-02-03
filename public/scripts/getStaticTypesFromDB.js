export let paymentTypesFromDB = [];
export async function setPaymentTypes(){
    try {
        let array = (
            await (await fetch(`${window.location.origin}/api/type/payment`)).json()
          ).data || [];
        paymentTypesFromDB = array;
    } catch (error) {
        console.log("Falle");
        return console.log(error);        
    }
};

export let shippingTypesFromDB = [];
export async function setShippingTypes(){
    try {
        let array = (
            await (await fetch(`${window.location.origin}/api/type/shipping`)).json()
          ).data || [];
          shippingTypesFromDB = array;
    } catch (error) {
        console.log("Falle");
        return console.log(error);        
    }
}

export let countriesFromDB = [];
export async function setCountries(){
    try {
        let array = (
            await (await fetch(`${window.location.origin}/api/type/country`)).json()
          ).data || [];
          countriesFromDB = array;
    } catch (error) {
        console.log("Falle");
        return console.log(error);        
    }
}

export let tacosFromDB = [];
export async function setTacos(){
    try {
        let array = (
            await (await fetch(`${window.location.origin}/api/type/taco`)).json()
          ).data || [];
          tacosFromDB = array;
    } catch (error) {
        console.log("Falle");
        return console.log(error);        
    }
}

export let sizesFromDB = [];
export async function setSizes(){
    try {
        let array = (
            await (await fetch(`${window.location.origin}/api/type/size`)).json()
          ).data || [];
          sizesFromDB = array;
    } catch (error) {
        console.log("Falle");
        return console.log(error);        
    }
}

export let categoriesFromDB = [];
export async function setCategories(){
    try {
        let array = (
            await (await fetch(`${window.location.origin}/api/type/category`)).json()
          ).data || [];
          categoriesFromDB = array;
    } catch (error) {
        console.log("Falle");
        return console.log(error);        
    }
}

export let gendersFromDB = [];
export async function setGenders(){
    try {
        let array = (
            await (await fetch(`${window.location.origin}/api/type/gender`)).json()
          ).data || [];
          gendersFromDB = array;
    } catch (error) {
        console.log("Falle");
        return console.log(error);        
    }
}

export async function getOrderStatuses(){
    try {
        const orderStatusesResponse = await fetch(`${window.location.origin}/api/type/order-statuses`);
        const orderStatusesJson = await orderStatusesResponse.json();
        return orderStatusesJson.data;
    } catch (error) {
        console.log("Falle");
        return console.log(error);        
    }
}


