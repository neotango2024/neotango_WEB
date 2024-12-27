import express from 'express';
import mainController from '../controllers/mainController.js';
const router = express.Router();

router.get('/',mainController.index);
router.get('/cart',mainController.cart);


export default router;