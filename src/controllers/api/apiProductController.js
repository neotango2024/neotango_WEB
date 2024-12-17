import db from '../../database/models/index.js';
const { Product } = db;
import { validationResult } from 'express-validator';
import systemMessages from '../../utils/staticDB/systemMessages.js';
import { v4 as UUIDV4 } from 'uuid';
import fileController, { insertFilesInDb, findFilesInDb, deleteFileInDb} from '../fileController.js';
import variationsController from '../variationsController.js';
import { getMappedErrors } from '../../utils/getMappedErrors.js';
import getFileType from '../../utils/getFileType.js';
import { destroyFilesFromAWS, uploadFilesToAWS } from '../../utils/awsHandler.js';
const {productMsg} = systemMessages;
const { fetchFailed, notFound, fetchSuccessfull, createFailed, updateFailed, deleteSuccess, createSuccessfull, deleteFailed } = productMsg;
const {insertVariationsInDb, findVariationsInDb, getVariationsToDelete, deleteVariationInDb, getVariationsToAdd} = variationsController;
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
            const [isCreated, newProductId] = await insertProductInDb(body);
            if(!isCreated){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            };

            // vamos a recibir variaciones que contienen size_id, taco_id, quantity
            const { variations, filesFromArray } = body;
            const isCreatingVariationsSuccessful = await insertVariationsInDb(variations, newProductId);
            if(!isCreatingVariationsSuccessful){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            };
            const files = req.files;
            files.forEach(multerFile => {
                const fileFromFilesArrayFiltered = filesFromArray.find(arrFile => arrFile.filename === multerFile.originalname)
                multerFile.file_types_id = getFileType(multerFile);
                multerFile.main_file = fileFromFilesArrayFiltered.main_file;
            });
            const objectToUpload = {
                files,
                folderName: PRODUCTS_FOLDER_NAME,
                sections_id: 2
            }
            const filesToInsertInDb = await uploadFilesToAWS(objectToUpload);
            if(!filesToInsertInDb){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            }
            const isInsertingFilesSuccessful = await insertFilesInDb(filesToInsertInDb, newProductId);
            if(!isInsertingFilesSuccessful){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            }
            return res.status(200).json({
                ok: true,
                msg: createSuccessfull.en,
                data: newProductId
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
        const variationsInDb = await findVariationsInDb(productId);
        const { variations } = req.body;
        const variationsToDelete = getVariationsToDelete(variations, variationsInDb, productId);
        const deleteVariationsPromises = variationsToDelete.map(async variationToDelete => {
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
        const variationsToAdd = getVariationsToAdd(variations, variationsInDb,productId);
        const isInsertingVariationsSuccessful = await insertVariationsInDb(variationsToAdd, productId);
        if(!isInsertingVariationsSuccessful){
            return res.status(500).json({
                ok: false,
                msg: updateFailed.es
            });
        }
        const imagesInDb = await findFilesInDb(productId);
        const imagesToKeep = req.body.current_images;
        // current_images
        // [
            // id: fileid
            // filename: randomName
            // main_image: 1
        //]
        // filesFromArray
        // [
            // filename: filename
            // main_image: 0 
        // ]
        // req.files
        let imagesToDelete;
        if(imagesToKeep && imagesToKeep.length > 0){
            imagesToDelete = imagesInDb.filter(img => !imagesToKeep.includes(img.filename));
        } else {
            imagesToDelete = imagesInDb;
        }
        const objectToDestroyInAws = {
            files: imagesToDelete,
            folderName: PRODUCTS_FOLDER_NAME
        }
        const isDeletionInAwsSuccessful = await destroyFilesFromAWS(objectToDestroyInAws);
        if(!isDeletionInAwsSuccessful){
            return res.status(500).json({
                ok: false,
                msg: updateFailed.es
            });
        }
        const deleteImagesPromises = imagesToDelete.map(async img => {
            const { id } = img;
            const deleteResult = await deleteFileInDb(id);
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
        let normalizedFilesToUpdateInDb = imagesToKeep.map(file => ({
            ...file
        }));
        if(req.files){
            const files = req.files;
            const { filesFromArray } = body;
            files.forEach(multerFile => {
                const fileFromFilesArrayFiltered = filesFromArray.find(arrFile => arrFile.filename === multerFile.originalname)
                multerFile.file_types_id = getFileType(multerFile);
                multerFile.main_file = fileFromFilesArrayFiltered.main_file;
            });
            const objectToUpload = {
                files,
                folderName: PRODUCTS_FOLDER_NAME,
                sections_id: 2
            }
            const filesToInsertInDb = await uploadFilesToAWS(objectToUpload);
            normalizedFilesToUpdateInDb = [
                ...normalizedFilesToUpdateInDb,
                ...filesToInsertInDb
            ]

            if(!filesToInsertInDb){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            }
            
        }
        const isInsertingFilesSuccessful = await insertFilesInDb(normalizedFilesToUpdateInDb, productId);
            if(!isInsertingFilesSuccessful){
                return res.status(500).json({
                    ok: false,
                    msg: createFailed.es
                });
            }
        return res.status(200).json({
            ok: true,
        })
    },
    handleDeleteProduct: async (req, res) => {
        try {
            const { productId } = productId;
            const isDeletedSuccessfully = await deleteProductInDb(productId);
            if(!isDeletedSuccessfully){
                return res.status(500).json({
                    ok: false,
                    msg: deleteFailed.es
                })
            }
            return res.status(200).json({
                ok: true,
                msg: deleteSuccess.es,
                data: productId
            })
        } catch (error) {
            console.log(`Error handling product deletion: ${error}`);
            return res.status(500).json({
                ok: false,
                msg: deleteFailed.es
            })
        }
    },
};

export default controller;


async function findProductInDb (productId) {
    try {
        const product = Product.findByPk(productId);
        return [true, product];
    } catch (error) {
        console.log(`Error finding product in db: ${error}`);
        return [false, null];
    }
}

async function deleteProductInDb (productId) {
    try {
        await Product.destroy({
            where: {
                product_id: productId
            }
        })
        return productId;
    } catch (error) {
        console.log(`error deleting product in db: ${error}`);
        return null;
    }
}  

async function insertProductInDb (body) {
    try {
        const newProductId = UUIDV4();
        const newProduct = {
            id: newProductId,
            ...body,
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

async function updateProductInDb(body, productId){
    try {
        await Product.update(body, {
            where: {
                id: productId
            }
        })
        return true;
    } catch (error) {
        console.log(`error updating product in db: ${error}`);
        return false;
    }
}
