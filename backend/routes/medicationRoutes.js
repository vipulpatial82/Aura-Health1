import express from 'express';
import { getMedications, addMedication, toggleMedication, deleteMedication, resetMedications } from '../controllers/medicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',              protect, getMedications);
router.post('/',             protect, addMedication);
router.patch('/:id/toggle',  protect, toggleMedication);
router.delete('/:id',        protect, deleteMedication);
router.post('/reset',        protect, resetMedications);

export default router;
