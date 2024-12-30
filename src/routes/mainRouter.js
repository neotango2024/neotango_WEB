import express from 'express';
import mainController from '../controllers/mainController.js';
const router = express.Router();

router.get('/',mainController.index);
router.get('/carro',mainController.cart);
router.get('/verificar',mainController.userVerification);
router.get('/producto/:id',mainController.productDetail);


export default router;