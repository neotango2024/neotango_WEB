import express from 'express';
const router = express.Router();
import apiUserController from '../../controllers/api/apiUserController.js';

// Validators

// GET
router.get('/address',apiUserController.getUserAddresses);


// POST
router.post('/',apiUserController.createUser);
// PUT

// DELETE

export default router;
