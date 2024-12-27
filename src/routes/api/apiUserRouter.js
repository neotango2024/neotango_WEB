import express from 'express';
const router = express.Router();
import apiUserController from '../../controllers/api/apiUserController.js';
import formValidations from '../../middlewares/formValidations.js';
import upload from '../../middlewares/multerMiddleware.js';
const {getUserAddresses, handleCheckForUserLogged, createUser, processLogin} = apiUserController;
// Validators

// GET
router.get('/address', getUserAddresses);
router.get('/check-for-user-logged', handleCheckForUserLogged);


// POST
router.post('/',formValidations.userCreateFields, createUser);
router.post('/login', processLogin);

// PUT

// DELETE

export default router;
