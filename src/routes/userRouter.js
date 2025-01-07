import express from 'express';
import userController from '../controllers/userController.js';
import getLastURL from '../middlewares/getLastURL.js';
const router = express.Router();

router.get('/logout',getLastURL,userController.logout);

export default router;