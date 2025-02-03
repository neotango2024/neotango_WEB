import apiShippingController from '../../controllers/api/apiShippingController.js';
import express from 'express';
const router = express.Router();

router.get('/zones', apiShippingController.getShippingZonesWithPrices);
router.put('/zones/:zoneId', apiShippingController.updateZone);

export default router;