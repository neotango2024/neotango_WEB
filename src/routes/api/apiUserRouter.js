import express from 'express';
const router = express.Router();
import apiUserController from '../../controllers/api/apiUserController.js';
import formValidations from '../../middlewares/formValidations.js';
import upload from '../../middlewares/multerMiddleware.js';
const {getUserOrders, getUserAddresses, handleCheckForUserLogged, createUser, updateUser, processLogin, generateNewEmailCode, checkForEmailCode} = apiUserController;
// Validators

// GET
router.get('/address', getUserAddresses);
router.get('/order', getUserOrders);
router.get('/check-for-user-logged', handleCheckForUserLogged);
router.get('/send-verification-code', generateNewEmailCode);


// POST
router.post('/',formValidations.userCreateFields, createUser);
router.post('/login', processLogin);
router.post('/check-verification-code', checkForEmailCode);

// PUT
router.put('/',formValidations.userUpdateFields, updateUser);

// DELETE

export default router;
