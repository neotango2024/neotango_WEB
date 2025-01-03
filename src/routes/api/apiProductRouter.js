import express from 'express';
import apiProductController from '../../controllers/api/apiProductController.js';
import formValidations from '../../middlewares/formValidations.js';
import multerMiddleware from '../../middlewares/multerMiddleware.js';

const router = express.Router();
const { handleCreateProduct, handleUpdateProduct, handleGetAllProducts, handleDeleteProduct } = apiProductController;
const {productFields} = formValidations;

router.get('/', handleGetAllProducts);
router.post('/',  multerMiddleware.array('images'), handleCreateProduct);
router.put('/:productId',  multerMiddleware.array('images'), handleUpdateProduct);
router.delete('/:productId', handleDeleteProduct);

export default router;
