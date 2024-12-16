import express from 'express';
import apiProductController from '../../controllers/api/apiProductController.js';
import formValidations from '../../middlewares/formValidations.js';
const router = express.Router();
const { handleCreateProduct } = apiProductController;
const {productFields} = formValidations;

router.post('/', productFields, handleCreateProduct);

export default router;
