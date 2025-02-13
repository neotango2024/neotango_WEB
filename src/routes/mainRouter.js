import express from 'express';
import mainController from '../controllers/mainController.js';
import getLastURL from '../middlewares/getLastURL.js';
import userIsLoggedMiddleware from '../middlewares/userIsLogged.js';
const router = express.Router();

router.get('/',mainController.index);
router.get('/carro',mainController.cart);
router.get('/verificar', userIsLoggedMiddleware,mainController.userVerification);
router.get('/categoria/:categoryId',mainController.productList);
router.get('/producto/:id',mainController.productDetail);
router.get('/perfil', userIsLoggedMiddleware, mainController.userProfile);
router.get('/nosotros',mainController.aboutUs);
router.get('/faq',mainController.faq);
router.get('/contacto',mainController.contact);
router.get('/post-compra',mainController.postOrder);
router.get('/logout',getLastURL,mainController.logout);
// PAYPAL
router.get('/completar-pago',mainController.completePayment);
router.get('/cancelar-orden',mainController.cancelOrder);

export default router;