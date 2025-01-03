import tacos from '../staticDB/tacos.js';
import sizes from '../staticDB/sizes.js'

export const populateTaco = (tacoId) => {
    return tacos.find(taco => taco.id === tacoId);
}

export const populateSize = (sizeId) => {
    return sizes.find(size => size.id === sizeId);
}