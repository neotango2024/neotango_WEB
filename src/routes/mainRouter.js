import express from 'express';
import mainController from '../controllers/mainController.js';
import getLastURL from '../middlewares/getLastURL.js';
const router = express.Router();

router.get('/',mainController.index);
router.get('/carro',mainController.cart);
router.get('/verificar',mainController.userVerification);
router.get('/categoria/:categoryId',mainController.productList);
router.get('/producto/:id',mainController.productDetail);
router.get('/perfil',mainController.userProfile);
router.get('/nosotros',mainController.aboutUs);
router.get('/faq',mainController.faq);
router.get('/contacto',mainController.contact);
router.get('/logout',getLastURL,mainController.logout);

export default router;