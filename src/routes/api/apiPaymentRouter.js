import express from 'express';
const router = express.Router();
import apiPaymentController from '../../controllers/api/apiPaymentController.js';

// GET
router.get('/paypal/request-token',apiPaymentController.generatePaymentOrderURL);
// POST




export default router;
