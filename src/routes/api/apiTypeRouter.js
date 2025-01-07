import express from 'express';
import apiTypeController from '../../controllers/api/apiTypeController.js';


const router = express.Router();


router.get('/payment', apiTypeController.getPaymentTypes);
router.get('/shipping', apiTypeController.getShippingTypes);
router.get('/country', apiTypeController.getCountries);
router.get('/taco', apiTypeController.getTacos);
router.get('/size', apiTypeController.getSizes);
router.get('/gender', apiTypeController.getGenders);

export default router;
