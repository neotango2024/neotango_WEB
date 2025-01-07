import express from 'express';
const router = express.Router();
import apiVariationsController from '../../controllers/api/apiVariationsController.js';

router.get('/', apiVariationsController.handleGetVariation);
router.put('/:variationId', apiVariationsController.handleUpdateVariation)
router.delete('/', apiVariationsController.handleDeleteVariation);

export default router;