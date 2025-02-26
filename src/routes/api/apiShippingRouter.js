import apiShippingController from '../../controllers/api/apiShippingController.js';
import express from 'express';
import adminCredentialsMiddleware from '../../middlewares/adminCredentialsMiddleware.js';
const router = express.Router();

router.get('/zones', apiShippingController.getShippingZonesWithPrices);
router.put('/zones/:zoneId', adminCredentialsMiddleware, apiShippingController.updateZone);

export default router;