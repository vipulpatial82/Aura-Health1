import Medication from '../models/Medication.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

export const getMedications = asyncHandler(async (req, res) => {
  const meds = await Medication.find({ userId: req.user.id }).sort({ time: 1 });
  res.json({ success: true, data: meds });
});

export const addMedication = asyncHandler(async (req, res) => {
  const { name, dosage, time, type } = req.body;
  if (!name || !time) throw new AppError('Name and time are required', 400);
  const med = await Medication.create({ userId: req.user.id, name, dosage, time, type });
  res.status(201).json({ success: true, data: med });
});

export const toggleMedication = asyncHandler(async (req, res) => {
  const med = await Medication.findOne({ _id: req.params.id, userId: req.user.id });
  if (!med) throw new AppError('Medication not found', 404);
  med.status = med.status === 'taken' ? 'pending' : 'taken';
  await med.save();
  res.json({ success: true, data: med });
});

export const deleteMedication = asyncHandler(async (req, res) => {
  const med = await Medication.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!med) throw new AppError('Medication not found', 404);
  res.json({ success: true });
});

// Reset all taken → pending (call at start of each day)
export const resetMedications = asyncHandler(async (req, res) => {
  await Medication.updateMany({ userId: req.user.id }, { $set: { status: 'pending' } });
  res.json({ success: true });
});
