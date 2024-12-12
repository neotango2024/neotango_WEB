import express from 'express';
const router = express.Router();
import apiUserController from '../../controllers/api/apiUserController.js';
import formValidations from '../../middlewares/formValidations.js';
import upload from '../../middlewares/multerMiddleware.js';
// Validators

// GET
router.get('/address',apiUserController.getUserAddresses);


// POST
router.post('/',formValidations.userCreateFields,apiUserController.createUser);
router.post('/test',upload.any('files'),apiUserController.testAWS);
// PUT

// DELETE

export default router;
