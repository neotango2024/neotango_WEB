import express from 'express';
const router = express.Router();
import apiAddressController from '../../controllers/api/apiAddressController.js';

// Validators

// GET


// POST
router.post('/',apiAddressController.createAddress);
// PUT
router.put('/',apiAddressController.updateAddress);

// DELETE
router.delete('/',apiAddressController.destroyAddress);

export default router;
