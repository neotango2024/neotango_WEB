import db from '../../database/models/index.js';
const { Product } = db;
import { validationResult } from 'express-validator';
import systemMessages from '../../utils/staticDB/systemMessages.js';
import { v4 as UUIDV4 } from 'uuid';
import productFileController, { insertFilesInDb } from '../productFileController.js';
import productSizeTacoColorQuantityController from '../productSizeTacoColorQuantityController.js';
import { getMappedErrors } from '../../utils/getMappedErrors.js';
import getFileType from '../../utils/getFileType.js';
import { uploadFilesToAWS } from '../../utils/awsHandler.js';
const {productMsg} = systemMessages;
const { fetchFailed, notFound, fetchSuccessfull, createFailed, updateFailed, findFilesInDb, createSuccessfull } = productMsg;
const { handleCreateFiles, deleteFileInDb } = productFileController;
const {insertVariationsInDb, findVariationsInDb, getVariationsToDelete, deleteVariationInDb} = productSizeTacoColorQuantityController;
const PRODUCTS_FOLDER_NAME = 'products';

const controller = {
    handleGetAllProducts: async (req, res) => {
        try {
            const categoryId = req.params.categoryId;
            let products;
            if(categoryId){
                products = await Product.findAll({
                    where: {
                        category_id: categoryId
                    }
                });
            } else {
                products = await Product.findAll();
            }
            return res.status(200).json({
                ok: true,
                data: products
            })
        } catch (error) {
            console.log(`error in handleGetAllProducts: ${e}`);
            return res.status(500).json({
                ok: false,
                msg: fetchFailed.en
            })
        }
    },
    handleGetOneProduct: async (req, res) => {
        try {
            const {productId} = req.query;
            const [isSuccessful, product] = await findProductInDb(productId);
            if(!product && !isSuccessful){
                return res.status(500).json({
                    ok: false,
                    msg: fetchFailed.en
                })
            }
            if(!product && isSuccessful){
                return res.status(404).json({
                    ok: false,
                    msg: notFound.en
                })
            }
            return res.status(200).json({
                ok: true,
                data: product,
                msg: fetchSuccessfull.en
            })
        } catch (error) {
            console.log(`error in handleGetOneProduct: ${e}`);
            return res.status(500).json({
                ok: false,
                msg: fetchFailed.en
            })
        }
    },
    handleCreateProduct: async (req, res) => {
        try {     
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                let {errorsParams,errorsMapped} = getMappedErrors(errors);
                return res.status(404).json({
                    ok: false,
                    msg: createFailed.es,
                    errors: errorsMapped,
                    params: errorsParams,
                })
            }
            const body = req.body;
            const [isCreated, productId] = await insertProductInDb(body);
            if(!isCreated){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            };
            const { variations, filesArray } = body;
            let objectToSendVariations = {
                variations, 
                productId,
                filesArray
            }
            const [isCreatingVariationsSuccessful,returnedArray] = await insertVariationsInDb(objectToSendVariations);
            if(!isCreatingVariationsSuccessful){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            };
            
            // todo - administras filesArray
            // pasar folder al object
            const files = req.files;
            files.forEach(multerFile => {
                let fileFromArray = returnedArray.find(file=>file.filename == multerFile.originalname);
                multerFile.file_types_id = getFileType(multerFile);
                multerFile.main_image = fileFromArray.main_image;
                multerFile.variation_id = fileFromArray.product_variation_id;
            });
            const objectToUpload = {
                files,
                folderName: PRODUCTS_FOLDER_NAME,
                sections_id: 2
            }
            const { filesToInsertInDb, relationsToReturn} = await uploadFilesToAWS(objectToUpload);
            const isSuccessful = await insertFilesInDb(filesToInsertInDb);
            
            if(!isSuccessful){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            }
            //TODO: tambien hay que hacer el bulkUpdate de las relaciones en la tabla pivot entre files y variation
            return res.status(200).json({
                ok: true,
                msg: createSuccessfull.en,
                data: productId
            })
        } catch (error) {
            console.log(`Error in handleCreateProduct: ${error}`);
            return res.status(500).json({
                ok: false,
                msg: createFailed.es
            });
        }
    },
    handleUpdateProduct: async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(404).json({
                ok: false,
                msg: createFailed.es,
                errors: errors.mapped()
            })
        }
        const productId = req.query.productId;
        const body = req.body;
        const isUpdateSuccessful = await updateProductInDb(body, productId);
        if(!isUpdateSuccessful){
            return res.status(500).json({
                ok: false,
                msg: updateFailed.en
            })
        }
        const currentProductImages = await findFilesInDb(productId);
        const imagesToKeep = req.body.images_to_keep;
        const imagesToDelete = currentProductImages.filter(img => !imagesToKeep.includes(img.file));
        const deleteImagesPromises = imagesToDelete.map(async img => {
            const { file } = img;
            const deleteResult = await deleteFileInDb(file, productId);
            return deleteResult;
        })
        const results = await Promise.all(deleteImagesPromises);
        const isAllDeleted = results.every(res => res === true);
        if(!isAllDeleted){
            return res.status(500).json({
                ok: false,
                msg: updateFailed.en
            })
        }
        if(req.files){
            const isCreatingImagesSuccessful = await handleCreateFiles(images, productId);
            if(!isCreatingImagesSuccessful){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            }
        }
        const variationsInDb = await findVariationsInDb(productId);
        const { variations } = req.body;
        const variationsToDelete = getVariationsToDelete(variations, variationsInDb);
        const deleteVariationsPromises = variationsToDelete.forEach(async variationToDelete => {
            const isDeleteSuccessful = await deleteVariationInDb(variationToDelete);
            return isDeleteSuccessful;
        })
        const promisesResult = await Promise.all(deleteVariationsPromises);
        const areAllVariationsDeleted = promisesResult.every(prom => prom === true);
        if(!areAllVariationsDeleted){
            return res.status(500).json({
                ok: false,
                msg: createFailed.es
            });
        }
        return res.status(200).json({
            ok: true,
            msg: createSuccessfull.es
        })
    },
    findProductInDb: async (productId) => {
        try {
            const product = Product.findByPk(productId);
            return [true, product];
        } catch (error) {
            console.log(`Error finding product in db: ${error}`);
            return [false, null];
        }
    },
    
    updateProductInDb: async (body, productId) => {
        try {
            await Product.update(body, {
                where: {
                    id: productId
                }
            })
            return true;
        } catch (error) {
            console.log(`Error updating product in db ${error}`);
            return false;
        }
    }
};

async function insertProductInDb (body) {
    try {
        const { name, english_description, spanish_description, ars_price, usd_price, sku, category_id } = body;
        const newProductId = UUIDV4();
        const newProduct = {
            id: newProductId,
            name, //TODO: agregar en ingles/espan
            english_description,
            spanish_description,
            ars_price,
            usd_price,
            sku,
            category_id,
            created_at: Date.now(), //TODO: ver si funciona sin esto
            updated_at: Date.now(),
            deleted_at: null
        };
        await Product.create(newProduct);
        return [true, newProductId];
    } catch (error) {
        console.log(`Error in insertProductInDb: ${error}`);
        return [false, null];
    }
}

export default controller;