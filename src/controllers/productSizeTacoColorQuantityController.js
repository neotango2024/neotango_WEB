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
    insertVariationsInDb: async (variations, productId) => {
        try {
            const mappedVariationsWithId = [];
            variations.forEach(variation => {
                const newVariationId = UUIDV4();
                mappedVariationsWithId.push({
                    id: newVariationId,
                    product_id: productId,
                    ...variation
                })
            });
            console.log(mappedVariationsWithId)
            ProductSizeTacoColorQuantity.bulkCreate(mappedVariationsWithId);
            return true;
        } catch (error) {
            console.log(`Error inserting variations in db: ${error}`);
            return false;
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