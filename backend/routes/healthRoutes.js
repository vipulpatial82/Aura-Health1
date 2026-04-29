import express from 'express';
import { saveHealthData, getHealthData, getHealthHistory } from '../controllers/healthController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { healthDataSchema } from '../validators/healthValidator.js';

const router = express.Router();

router.get('/data',    protect, getHealthData);
router.get('/history', protect, getHealthHistory);
router.post('/save',   protect, validate(healthDataSchema), saveHealthData);

export default router;
