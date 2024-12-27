import express from 'express';
const router = express.Router();
import apiOrderController from '../../controllers/api/apiOrderController.js';
import formValidations from '../../middlewares/formValidations.js';
// Validators
// GET
router.get('/',apiOrderController.getOrders);
// POST
router.post('/',formValidations.orderFields,apiOrderController.createOrder);
// PUT
router.put('/',formValidations.addressFields,apiOrderController.updateOrder);


export default router;
