import express from 'express';
import apiCartController from '../../controllers/api/apiCartController.js';

const router = express.Router();
const { handleCreateCartItem, handleGetCartItems, handleDeleteCartItem } = apiCartController;

router.get('/:userId', handleGetCartItems);
router.post('/:userId',  handleCreateCartItem);
router.delete('/:cartId', handleDeleteCartItem);

export default router;
