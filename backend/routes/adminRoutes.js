import express from 'express';
import { getAllDoctors, getAllPatients, addDoctor, updateDoctor, removeDoctor } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(protect, requireRole('admin'));

router.get('/doctors',        getAllDoctors);
router.post('/doctors',       addDoctor);
router.put('/doctors/:id',    updateDoctor);
router.delete('/doctors/:id', removeDoctor);
router.get('/patients',       getAllPatients);

export default router;
