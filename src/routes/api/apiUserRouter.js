import express from 'express';
const router = express.Router();
import apiUserController from '../../controllers/api/apiUserController.js';
import formValidations from '../../middlewares/formValidations.js';

// Validators

// GET
router.get('/address',apiUserController.getUserAddresses);


// POST
router.post('/',formValidations.userCreateFields,apiUserController.createUser);
// PUT

// DELETE

export default router;
