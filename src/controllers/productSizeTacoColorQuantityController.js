import db from '../database/models/index.js';
import { v4 as UUIDV4 } from 'uuid';
const {ProductSizeTacoColorQuantity} = db;

const controller = {
    findVariationsInDb: async (productId) => {
        try {
            const variations = await ProductSizeTacoColorQuantity.findAll({
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
    insertVariationsInDb: async (object) => {
        try {
            const mappedVariationsWithId = [];
            
            object?.variations?.forEach(variation => { //{ size_id, taco_id, color_id, stock}
                const newVariationId = UUIDV4();
                mappedVariationsWithId.push({
                    id: newVariationId,
                    product_id: object.productId,
                    ...variation
                });
            });
            //Ahora recorro el array de fileObjects y junto por color_id
            let arrayToReturn = [];
            object.filesArray?.forEach(fileObj=>{ //{filename, color_id, main_image}
                //Aca tengo que ir pusheando la variacion con su file
                let colorIDToFilter = fileObj.color_id;
                //aca obtengo array de los ids de la variacion para este archivo
                let array =  mappedVariationsWithId.filter(obj=>obj.color_id == colorIDToFilter).map(obj=>({
                    product_variation_id: obj.id,
                    filename: fileObj.filename,
                    main_image: fileObj.main_image,
                }));
                arrayToReturn = [...arrayToReturn,...array]; //Lo pusheo al array
            })
            ProductSizeTacoColorQuantity.bulkCreate(mappedVariationsWithId);
            return [true,arrayToReturn];
        } catch (error) {
            console.log(`Error inserting variations in db: ${error}`);
            return [false,null];
        }
    },
    getVariationsToDelete: (bodyVariations, dbVariations) => {
        let variationsToDelete = [];
        dbVariations.forEach(dbVar => {
            const existsInBody = bodyVariations.some(bodyVar => {
                const isSameColor = dbVar.color_id === bodyVar.color_id;
                const isSameSize = dbVar.size_id === bodyVar.size_id;
                const isSameProduct = dbVar.product_id === bodyVar.product_id;
                const isSameTaco = dbVar.taco_id === bodyVar.taco_id;
                return isSameColor && isSameSize && isSameTaco && isSameProduct;
            });
            
            if (!existsInBody) {
                variationsToDelete.push(dbVar.id);
            }
        });
        return variationsToDelete;
    },
    deleteVariationInDb: async (variation) => {
        try {
            await ProductSizeTacoColorQuantity.destroy({
                where: {
                    id: variation.id
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