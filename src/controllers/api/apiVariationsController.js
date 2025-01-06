import db from '../../database/models/index.js'
import { v4 as UUIDV4 } from 'uuid';
import { normalizeToString } from '../../utils/helpers/normalizeData.js';
import { populateSize, populateTaco } from '../../utils/helpers/populateStaticDb.js';
import { getFilesFromAWS } from '../../utils/helpers/awsHandler.js';
const {Variation, Product} = db;

const controller = {
    handleGetVariation: async (req, res) => {
        try {
            const {variationId} = req.query;
            if(!variationId){
                return res.status(500).json({
                    ok: false,
                    msg: 'No variation id was provided'
                })
            }
            const variations = await findVariationsById(variationId);
            if(!variations){
                return res.status(404).json({
                    ok: false,
                    msg: 'Variation not found'
                })
            }
            return res.status(200).json({
                ok: true,
                data: variations
            })
        } catch (error) {
            console.log(`Error in handleGetVariations: ${error}`);
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error'
            })
        }
    },
    handleDeleteVariation: async (req, res) => {
        try {
            const {variationId} = req.query;
            let variationsToDelete = [];
            if(Array.isArray(variationId)){
                variationsToDelete = variationId;
            } else {
                variationsToDelete.push(variationId)
            }
            const deletePromises = variationsToDelete.map( async (variation) => {
                const successDeleting = await deleteVariationInDb(variation);
                return successDeleting;
            })
            const results = await Promise.all(deletePromises); 
            const areAllPromisesSuccessfull = results.every(res => res === true);
            return res.status(200).json({
                ok: true,
                msg: `${areAllPromisesSuccessfull ? 'All variations were deleted' : 'Some variations where deleted'}`
            })
        } catch (error) {
            console.log('error deleting variation ' + error);
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error'
            })
        }
    }
}

export default controller;

export const findVariationsById = async (variationId) => {
    try {
        if(typeof variationId === 'string'){
            const sanitizedVariationId = variationId.trim();
            let variationArray = [];
            const variation = await Variation.findByPk(sanitizedVariationId, { 
                include: [{
                    association: 'product',
                    include: [{
                        association: 'files'
                    }]
                }]
             }
            );
            variationArray.push(variation);
            const [variationTacoSizePopulated] = populateVariations(variationArray);
            const {taco, size} = variationTacoSizePopulated;
            const productVariation = variationArray[0].product;
            const variationProdFiles = productVariation.files;
            await getFilesFromAWS({
                folderName: 'products',
                files: variationProdFiles
            });
            return {
                id: variation.id,
                quantity: variation.quantity,
                product: productVariation,
                taco,
                size
            }
        } else if (Array.isArray(variationId)){
            let variationsArrayToReturn = [];
            // this means is an array
            const variationsInDb = await Variation.findAll({ 
                where: {
                    id: variationId
                },
                include: [{
                    association: 'product',
                    include: [{
                        association: 'files'
                    }]
                }]
             }
            );
            for(let i = 0; i < variationsInDb.length; i++){
                const variation = variationsInDb[i];
                const variationToPopulate = [variation];
                const [variationTacoSizePopulated] = populateVariations(variationToPopulate);
                const {taco, size} = variationTacoSizePopulated;
                const productVariation = variationToPopulate[0].product;
                const variationProdFiles = productVariation.files;
                await getFilesFromAWS({
                    folderName: 'products',
                    files: variationProdFiles
                });
                const variationToPush = {
                    id: variation.id,
                    quantity: variation.quantity,
                    product: productVariation,
                    taco,
                    size
                }
                variationsArrayToReturn.push(variationToPush);
            }
            return variationsArrayToReturn;
        } else {
            variationsToReturn = null;
        }
    } catch (error) {
        console.log(`Error finding variations in db: ${error}`);
        return null;
    }
}

export const insertVariationsInDb = async (variations, productId) => {
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
};

export const getVariationsToDelete = (bodyVariations, dbVariations, productId) => {
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
};

export const getVariationsToAdd = (bodyVariations, dbVariations, productId) => {
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
};

export const deleteVariationInDb = async (variation) => {
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
};

export const populateVariations = (variations) => {
    return variations.map(variation => {
        const { id, size_id, taco_id, quantity, product_id } = variation;

        const tacoPopulated = populateTaco(taco_id);
        const sizePopulated = populateSize(size_id);

        return {
            id,
            quantity,
            product_id,
            taco: tacoPopulated,
            size: sizePopulated
        };
    });
}

export const findProductVariations = async (productId) => {
    try {
        const productVariations = await Variation.findAll({
            where: {
                product_id: productId
            }
        })
        return productVariations;
    } catch (error) {
        console.log(`Error in findProductVariations: ${error}`);
        return null;
    }
}