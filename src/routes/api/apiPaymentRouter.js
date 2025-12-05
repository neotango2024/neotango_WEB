import express from 'express';
const router = express.Router();
import {testMails} from '../../controllers/api/apiPaymentController.js';
import { validateTestKey } from '../../middlewares/testApiKey.js';

// GET

// POST

router.get('/test-mail', validateTestKey, testMails);


export default router;
