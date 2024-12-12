import express from 'express';
import apiProductController from '../../controllers/api/apiProductController.js';
const router = express.Router();
const { handleCreateProduct } = apiProductController;

router.post('/', handleCreateProduct);

export default router;
