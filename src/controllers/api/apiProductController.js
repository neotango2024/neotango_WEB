import db from '../../database/models/index.js';
const { Product } = db;
import { validationResult } from 'express-validator';
import systemMessages from '../../utils/staticDB/systemMessages.js';
import { v4 as UUIDV4 } from 'uuid';
import fileController, { insertFilesInDb, findFilesInDb, deleteFileInDb} from '../fileController.js';
import { findProductVariations, insertVariationsInDb, getVariationsToDelete, getVariationsToAdd, deleteVariationInDb, populateVariations } from '../api/apiVariationsController.js';
import { getMappedErrors } from '../../utils/helpers/getMappedErrors.js';
import getFileType from '../../utils/helpers/getFileType.js';
import { destroyFilesFromAWS, getFilesFromAWS, uploadFilesToAWS } from '../../utils/helpers/awsHandler.js';
import getDeepCopy from '../../utils/helpers/getDeepCopy.js';
import tacos from '../../utils/staticDB/tacos.js';
import sizes from '../../utils/staticDB/sizes.js';
import {categories} from '../../utils/staticDB/categories.js';
import minDecimalPlaces from '../../utils/helpers/minDecimalPlaces.js';
import { HTTP_STATUS } from '../../utils/staticDB/httpStatusCodes.js';

const {productMsg} = systemMessages;
const { fetchFailed, notFound, fetchSuccessfull, createFailed, updateFailed, deleteSuccess, createSuccessfull, deleteFailed } = productMsg;
const PRODUCTS_FOLDER_NAME = 'products';

const controller = {
    handleGetAllProducts: async (req, res) => {
        try {
            let {categoryId, productId, limit, offset} = req.query
            if(limit) limit = parseInt(limit);
            if(categoryId) categoryId = parseInt(categoryId);
            if(offset) offset = parseInt(offset);
            let products;
            if(productId){
                const foundProduct = await findProductsInDb(productId,null,true, null, null);
                if(!foundProduct){
                    return res.status(HTTP_STATUS.NOT_FOUND.code).json({
                        ok: false,
                        msg: notFound,
                        data: []
                    })
                } 
                if (Array.isArray(foundProduct)) { //Si hizo un fetch por arrays entocnes aca llega arary
                    products = [...foundProduct];
                } else{
                    products = [foundProduct];
                }
            } else {
                const productsFetched = await findProductsInDb(null,categoryId,true, limit, offset);                
                if (!productsFetched.length){
                    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                        ok: false,
                        msg: fetchFailed.es,
                        data: []
                    })
                }
                products = productsFetched;           
            }
            return res.status(HTTP_STATUS.OK.code).json({
                ok: true,
                data: products
            })
        } catch (error) {
            console.log(`error in handleGetAllProducts:`);
            console.log(error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
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
                return res.status(HTTP_STATUS.BAD_REQUEST.code).json({
                    ok: false,
                    msg: createFailed.es,
                    errors: errorsMapped,
                    params: errorsParams,
                })
            }
            const body = req.body;
            const [isCreated, newProductId] = await insertProductInDb(body);
            if(!isCreated){
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                    ok: false,
                    msg: createFailed.es
                });
            };

            // vamos a recibir variaciones que contienen size_id, taco_id, quantity
            let { variations, filesFromArray } = body;
            variations = JSON.parse(req.body.variations);
            filesFromArray = JSON.parse(req.body.filesFromArray);
            const isCreatingVariationsSuccessful = await insertVariationsInDb(variations, newProductId);
            if(!isCreatingVariationsSuccessful){
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                    ok: false,
                    msg: createFailed.es
                });
            };
            const files = req.files;
            if(files && files.length){
                files?.forEach(multerFile => {
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
                    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                        ok: false,
                        msg: createFailed.es
                    });
                }
                const isInsertingFilesSuccessful = await insertFilesInDb(filesToInsertInDb, newProductId);
                if(!isInsertingFilesSuccessful){
                    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                        ok: false,
                        msg: createFailed.es
                    });
                }
            }
            
            let productToReturn = await findProductsInDb(newProductId,null,true)
            return res.status(HTTP_STATUS.OK.code).json({
                ok: true,
                msg: createSuccessfull.en,
                product: productToReturn
            })
        } catch (error) {
            console.log(`Error in handleCreateProduct: ${error}`);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                ok: false,
                msg: createFailed.es
            });
        }
    },
    handleUpdateProduct: async (req, res) => {
        // return console.log(req.body);
        
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(HTTP_STATUS.BAD_REQUEST.code).json({
                ok: false,
                msg: updateFailed,
                errors: errors.mapped()
            })
        }
        const body = req.body;
        const  { id: productId } = body;
        
        const isUpdateSuccessful = await updateProductInDb(body, productId);
        if(!isUpdateSuccessful){
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                ok: false,
                msg: updateFailed.en
            })
        }
        const variationsInDb = await findProductVariations(productId);
        let { variations } = req.body;
        variations = JSON.parse(req.body.variations);
        const variationsToDelete = getVariationsToDelete(variations, variationsInDb, productId);
        const deleteVariationsPromises = variationsToDelete.map(async variationToDelete => {
            const isDeleteSuccessful = await deleteVariationInDb(variationToDelete);
            return isDeleteSuccessful;
        })
        const promisesResult = await Promise.all(deleteVariationsPromises);
        const areAllVariationsDeleted = promisesResult.every(prom => prom === true);
        if(!areAllVariationsDeleted){
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                ok: false,
                msg: createFailed.es
            });
        }
        const variationsToAdd = getVariationsToAdd(variations, variationsInDb,productId);
        const isInsertingVariationsSuccessful = await insertVariationsInDb(variationsToAdd, productId);
        if(!isInsertingVariationsSuccessful){
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                ok: false,
                msg: updateFailed.es
            });
        }
        const imagesInDb = await findFilesInDb(productId);
        let imagesToKeep = req.body.current_images;
        imagesToKeep = JSON.parse(imagesToKeep);
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
            imagesToDelete = imagesInDb.filter(img => !imagesToKeep.map(img=>img.filename).includes(img.filename));
        } else {
            imagesToDelete = imagesInDb;
        }
        const objectToDestroyInAws = {
            files: imagesToDelete,
            folderName: PRODUCTS_FOLDER_NAME
        }
        const isDeletionInAwsSuccessful = await destroyFilesFromAWS(objectToDestroyInAws);
        if(!isDeletionInAwsSuccessful){
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
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
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                ok: false,
                msg: updateFailed.en
            })
        }
        let normalizedFilesToUpdateInDb = imagesToKeep.map(file => ({
            ...file
        }));
        if(req.files){
            const files = req.files;
            let { filesFromArray } = body;
            filesFromArray = JSON.parse(filesFromArray);
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
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                    ok: false,
                    msg: createFailed.es
                });
            }
            
        }
        const isInsertingFilesSuccessful = await insertFilesInDb(normalizedFilesToUpdateInDb, productId);
            if(!isInsertingFilesSuccessful){
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                    ok: false,
                    msg: createFailed.es
                });
            };
        let productToReturn = await findProductsInDb(productId,null,true)
        return res.status(HTTP_STATUS.OK.code).json({
            ok: true,
            product: productToReturn,
            msg: systemMessages.productMsg.updateSuccessfull
        })
    },
    handleDeleteProduct: async (req, res) => {
        try {
            const productId = req.params.productId;
            if(!productId){
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                    ok: false,
                    msg: deleteFailed.es
                })
            }
            const isDeletedSuccessfully = await deleteProductInDb(productId);
            if(!isDeletedSuccessfully){
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                    ok: false,
                    msg: deleteFailed.es
                })
            }
            return res.status(HTTP_STATUS.OK.code).json({
                ok: true,
                msg: deleteSuccess,
                data: productId
            })
        } catch (error) {
            console.log(`Error handling product deletion: ${error}`);
            console.log(error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                ok: false,
                msg: deleteFailed.es
            })
        }
    },
};

export default controller;

let productIncludeArray =  [
    'files',
    'variations'
]
export async function findProductsInDb(id = null, categoryId = null, withImages = false, limit, offset) {
    try {
    let productsToReturn, productToReturn;
    // Condición si id es un string
    if (typeof id === "string") {
        productToReturn = await db.Product.findByPk(id,{
          include: productIncludeArray,
          limit,
          offset
        });
        if(!productToReturn) return null
        productToReturn = getDeepCopy(productToReturn);
        await setProductKeysToReturn(productToReturn, withImages); //Setea las keys para devolver front
        return productToReturn;
    } else if (Array.isArray(id)) {
        // Condición si id es un array
        productsToReturn = await db.Product.findAll({
          where: {
            id: id, // id es un array, se hace un WHERE id IN (id)
          },
          include: productIncludeArray,
          limit,
          offset
        });
    } else if(categoryId){
        productsToReturn = await Product.findAll({
                where: {
                    category_id: categoryId
                },
                include: productIncludeArray,
                limit,
                offset
            });
          
        } else{
            productsToReturn = await Product.findAll({
                include: productIncludeArray,
                limit,
                offset
            });
        }
        if(!productToReturn && (!productsToReturn || !productsToReturn.length)) return null
        productsToReturn = getDeepCopy(productsToReturn);
        for (let i = 0; i < productsToReturn.length; i++) {
            const prod = productsToReturn[i];
            await setProductKeysToReturn(prod, true);
        }    
        return productsToReturn;
    } catch (error) {
        console.log(`error finding products in db: ${error}`);
        return null
    }
}

async function deleteProductInDb (productId) {
    try {
        const rowsAffected = await Product.destroy({
            where: {
                id: productId
            }
        })
        return rowsAffected > 0;
    } catch (error) {
        console.log(`error deleting product in db: ${error}`);
        console.log(error);
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

export async function getVariationsFromDB(id) {
    try {
        let includeObj = ["product"];
        // Condición si id es un string
        if (typeof id === "string") {
          let variationToReturn = await db.Variation.findByPk(id,{
            include: includeObj
          });
          if(!variationToReturn)return null
          variationToReturn = variationToReturn && getDeepCopy(variationToReturn);
          //Aca le agrego los tacos y eso
          setVariationObjToReturn(variationToReturn)
          return variationToReturn;
        }
        // Condición si id es un array
        if (Array.isArray(id)) {
          let variationsToReturn = await db.Variation.findAll({
            where: {
              id: id, // id es un array, se hace un WHERE id IN (id)
            },
            include: includeObj,
          });
          if(!variationsToReturn.length)return null
          variationsToReturn = getDeepCopy(variationsToReturn);
          //Aca le agrego los tacos y eso
          variationsToReturn.forEach(variation => setVariationObjToReturn(variation));
          return variationsToReturn;
        }
    
        // Condición si id es undefined
        if (id === undefined) {
          let variationsToReturn = await db.Variation.findAll({
            include: includeObj
          });
          if(!variationsToReturn.length)return null
          variationsToReturn = getDeepCopy(variationsToReturn);
          //Aca le agrego los tacos y eso
          variationsToReturn.forEach(variation => setVariationObjToReturn(variation));
          return variationsToReturn;
        }
      } catch (error) {
        console.log("Falle en getVariationsFromDB");
        console.error(error);
        return null;
      }
}
//compra 3 productos ==> 
function setVariationObjToReturn(variation){
    variation.taco = tacos.find(taco=>taco.id == variation.taco_id)
    variation.size = sizes.find(size=>size.id == variation.size_id)
};

async function setProductKeysToReturn(prod, withImages = false){
try {     
    //Le seteo la categoria
    prod.category = categories.find(cat=>cat.id == prod.category_id);
    prod.variations = populateVariations(prod.variations);
    prod.ars_price = minDecimalPlaces(prod.ars_price);
    prod.usd_price = minDecimalPlaces(prod.usd_price);
    if(withImages && prod.files?.length){
        await getFilesFromAWS({
            folderName: 'products',
            files: prod.files
        });               
    }  
} catch (error) {
    console.log('falle');
    return console.log(error);
    
}
}