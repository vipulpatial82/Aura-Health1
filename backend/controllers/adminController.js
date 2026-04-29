import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import bcrypt from 'bcrypt';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

export const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().populate('userId', 'name email');
  res.json({ success: true, data: doctors });
});

export const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await User.find({ role: 'patient' }).select('name email createdAt lastLogin').sort({ createdAt: -1 });
  res.json({ success: true, data: patients });
});

export const addDoctor = asyncHandler(async (req, res) => {
  const { name, email, specialization, experience, workingHours } = req.body;
  if (!name || !email || !specialization) throw new AppError('Name, email and specialization are required', 400);

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409);

  const hashed = await bcrypt.hash(process.env.SEED_PASSWORD || 'Doctor@123', 12);
  const user = await User.create({ name, email, password: hashed, role: 'doctor' });
  const doctor = await Doctor.create({
    userId: user._id,
    specialization,
    experience: Number(experience) || 0,
    workingHours,
    isAvailable: true,
  });

  res.status(201).json({ success: true, data: { user: { id: user._id, name, email }, doctor } });
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doctor) throw new AppError('Doctor not found', 404);
  res.json({ success: true, data: doctor });
});

export const removeDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new AppError('Doctor not found', 404);
  await User.findByIdAndDelete(doctor.userId);
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Doctor removed' });
});
