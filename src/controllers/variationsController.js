import db from '../database/models/index.js';
import { v4 as UUIDV4 } from 'uuid';
import { normalizeToString } from '../utils/normalizeData.js';
const {Variation} = db;

const controller = {
    findVariationsInDb: async (productId) => {
        try {
            const variations = await Variation.findAll({
                where: {
                    product_id: productId
                }
            })
            return variations;
        } catch (error) {
            console.log(`Error finding variations in db: ${error}`);
            return null;
        }
    },
    insertVariationsInDb: async (variations, productId) => {
        try {
            const mappedVariationsWithId = [];
            variations.forEach(variation => { //{ size_id, taco_id, color_id, stock}
                const newVariationId = UUIDV4();
                mappedVariationsWithId.push({
                    id: newVariationId,
                    product_id: productId,
                    ...variation
                });
            });
            // //Ahora recorro el array de fileObjects y junto por color_id
            // let variationFileArray = [];
            // filesArray.forEach(fileObj=>{ //{filename, color_id, main_image}
            //     //Aca tengo que ir pusheando la variacion con su file
            //     let colorIDToFilter = fileObj.color_id;
            //     const {filename, main_image} = fileObj;
            //     // aca obtengo array de los ids de la variacion para este archivo
            //     let array =  mappedVariationsWithId.filter(obj=>obj.color_id == colorIDToFilter).map(obj=>({
            //         product_variation_id: obj.id,
            //         filename: filename,
            //         main_image: main_image,
            //     }));
            //      variationFileArray = [... variationFileArray,...array]; //Lo pusheo al array
            // })
            Variation.bulkCreate(mappedVariationsWithId);
            return true;
        } catch (error) {
            console.log(`Error inserting variations in db: ${error}`);
            return [false,null];
        }
    },
    getVariationsToDelete: (bodyVariations, dbVariations, productId) => {
        let variationsToDelete = [];
        dbVariations.forEach(dbVar => {
            const existsInBody = bodyVariations.some(bodyVar => {
                const isSameSize = normalizeToString(dbVar.size_id) === normalizeToString(bodyVar.size_id);
                const isSameProduct = normalizeToString(dbVar.product_id) === normalizeToString(productId);
                const isSameTaco = normalizeToString(dbVar.taco_id) === normalizeToString(bodyVar.taco_id);
    
                return isSameSize && isSameTaco && isSameProduct;
            });
            
            if (!existsInBody) {
                variationsToDelete.push(dbVar.id);
            }
        });
        return variationsToDelete;
    },
    getVariationsToAdd: (bodyVariations, dbVariations, productId) => {
        let variationsToAdd = [];
    
        bodyVariations.forEach((bodyVar, index) => {
    
            const existsInDB = dbVariations.some(dbVar => {
                const isSameSize = normalizeToString(bodyVar.size_id) === normalizeToString(dbVar.size_id);
                const isSameProduct = normalizeToString(productId) === normalizeToString(dbVar.product_id);  // Comparando el product_id correctamente
                const isSameTaco = normalizeToString(bodyVar.taco_id) === normalizeToString(dbVar.taco_id);
    
                return isSameSize && isSameTaco && isSameProduct;
            });
    
            if (!existsInDB) {
                variationsToAdd.push(bodyVar);
            } 
        });

        return variationsToAdd;
    },
    deleteVariationInDb: async (variation) => {
        try {
            await Variation.destroy({
                where: {
                    id: variation
                }
            })
            return true;
        } catch (error) {
            console.log(`Error deleting variation in db ${error}`);
            return false;
        }
    }
}

export default controller;