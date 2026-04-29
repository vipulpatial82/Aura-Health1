import express from 'express';
import Doctor from '../models/Doctor.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

// Public — used by home page DoctorsSection
router.get('/', asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ isAvailable: true })
    .populate('userId', 'name email')
    .select('specialization experience rating workingHours userId');
  res.json({ success: true, data: doctors });
}));

export default router;
