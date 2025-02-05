import express from 'express';
const router = express.Router();
import apiPaymentController from '../../controllers/api/apiPaymentController.js';

// GET
router.get('/create-order',apiPaymentController.getOrders);
router.get('/capture-order',apiPaymentController.getOrders);
router.get('/cancel-order',apiPaymentController.getOrders);
// POST




export default router;
