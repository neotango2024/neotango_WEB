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
