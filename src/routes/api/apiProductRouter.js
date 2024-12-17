import express from 'express';
import apiProductController from '../../controllers/api/apiProductController.js';
import formValidations from '../../middlewares/formValidations.js';
import multerMiddleware from '../../middlewares/multerMiddleware.js';

const router = express.Router();
const { handleCreateProduct, handleUpdateProduct } = apiProductController;
const {productFields} = formValidations;

router.post('/',  multerMiddleware.array('images'), handleCreateProduct);
router.put('/',  multerMiddleware.array('images'), handleUpdateProduct);

export default router;
