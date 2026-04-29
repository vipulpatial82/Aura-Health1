import express from 'express';
import { bookAppointment, getMyAppointments, cancelAppointment, getAllAppointments, updateAppointment } from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Patient routes
router.post('/',           protect, bookAppointment);
router.get('/my',          protect, getMyAppointments);
router.patch('/:id/cancel', protect, cancelAppointment);

// Admin / Doctor routes
router.get('/',            protect, requireRole('admin', 'doctor'), getAllAppointments);
router.patch('/:id',       protect, requireRole('admin', 'doctor'), updateAppointment);

export default router;
