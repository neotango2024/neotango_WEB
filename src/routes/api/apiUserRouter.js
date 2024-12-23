import express from 'express';
const router = express.Router();
import apiUserController from '../../controllers/api/apiUserController.js';
import formValidations from '../../middlewares/formValidations.js';
import upload from '../../middlewares/multerMiddleware.js';
const {getUserAddresses, handleCheckForUserLogged, createUser, testAWS} = apiUserController;
// Validators

// GET
router.get('/address', getUserAddresses);
router.get('/check-for-user-logged', handleCheckForUserLogged);


// POST
router.post('/',formValidations.userCreateFields, createUser);
router.post('/test',upload.any('files'), testAWS);
// PUT

// DELETE

export default router;
