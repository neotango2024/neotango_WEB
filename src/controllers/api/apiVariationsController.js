import db from '../../database/models/index.js'
import { v4 as UUIDV4 } from 'uuid';
import { normalizeToString } from '../../utils/helpers/normalizeData.js';
import { populateSize, populateTaco } from '../../utils/helpers/populateStaticDb.js';
import { getFilesFromAWS } from '../../utils/helpers/awsHandler.js';
import sizes from '../../utils/staticDB/sizes.js';
import tacos from '../../utils/staticDB/tacos.js';
import { findProductsInDb } from './apiProductController.js';
import getDeepCopy from '../../utils/helpers/getDeepCopy.js';
const {Variation } = db;

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
    handleCreateVariation: async (req, res) => {
        try {
            const {productId} = req.params;
            const productExists = await findProductsInDb(productId);
            if(!productExists){
                return res.status(404).json({
                    ok: false,
                    msg: 'Product was not found'
                })
            }
            const {variations} = req.body;
            const isSuccessfulInsertingVariation = insertVariationsInDb(variations, productId);
            if(!isSuccessfulInsertingVariation){
                return res.status(500).json({
                    ok: false,
                    msg: 'Internal server error'
                })
            }
            return res.status(200).json({
                ok: true,
                msg: 'Successfully created the variations'
            })
        } catch (error) {
            console.log(`error in handleCreateVariation: ${error}`);
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error'
            })
        }
    },
    handleUpdateVariation: async (req, res) => {
        try {
            const { variationId } = req.params;
            const { quantity } = req.body;
            const successfulUpdating = await updateVariationInDb(variationId, quantity);
            if(successfulUpdating){
                return res.status(500).json({
                    ok: false,
                    msg: 'Internal server error'
                })
            }
            return res.status(200).json({
                ok: true,
                msg: 'Successfully updated variation'
            })
        } catch (error) {
            console.log(`error in update variation: ${error}`);
            return res.status(200).json({
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

let variationIncludeArray = [{
    association: 'product',
    include: [{
        association: 'files'
    }]
}]
export const findVariationsById = async (variationId) => { 
    try {
        let variationsArrayToReturn = [];
        if(typeof variationId === 'string'){
            const sanitizedVariationId = variationId.trim();
            let variationFromDB = await Variation.findByPk(sanitizedVariationId, { 
                include: variationIncludeArray
             }
            );
            variationFromDB = getDeepCopy(variationFromDB);
            let variationToPush = await handleVariationToReturn(variationFromDB);
            variationsArrayToReturn.push(variationToPush);
        } else if (Array.isArray(variationId)){
            // this means is an array
            const variationsInDb = await Variation.findAll({ 
                where: {
                    id: variationId
                },
                include: variationIncludeArray
             }
            );
            for(let i = 0; i < variationsInDb.length; i++){
                const variation = variationsInDb[i];
                let variationToPush = await handleVariationToReturn(variation)
                variationsArrayToReturn.push(variationToPush);
            }
        } else {
            variationsArrayToReturn = [];
        };
        return variationsArrayToReturn
    } catch (error) {
        console.log(`Error finding variations in db: ${error}`);
        return null;
    }
}
async function handleVariationToReturn (variation){
    try {
        const variationToPopulate = [variation]; //esto es para mandar a la funcino que popula
    const [variationTacoSizePopulated] = populateVariations(variationToPopulate);
    const {taco, size} = variationTacoSizePopulated;    
    const productVariation = getDeepCopy(variationToPopulate[0].product);
    const variationProdFiles = productVariation?.files;
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
    };
    return variationToPush
    } catch (error) {
        return console.log(error);
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
                quantity: variation.quantity,
                size_id: variation.sizeId,
                taco_id: variation.tacoId
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
        await Variation.bulkCreate(mappedVariationsWithId);
        return true;
    } catch (error) {
        console.log(`Error inserting variations in db: ${error}`);
        return false;
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

export const updateVariationInDb = async (variationId, quantity) => {
    try {
        const affectedRows = await Variation.update({
            quantity
        }, {
            where: {
                id: variationId
            }
        })
        return affectedRows > 0;
    } catch (error) {
        console.log('error updating variation in db' + error);
        return false;
    }
}