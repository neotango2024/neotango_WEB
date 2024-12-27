import express from 'express';
import apiTypeController from '../../controllers/api/apiTypeController.js';


const router = express.Router();


router.get('/payment', apiTypeController.getPaymentTypes);
router.get('/shipping', apiTypeController.getShippingTypes);
router.get('/country', apiTypeController.getCountries);

export default router;
