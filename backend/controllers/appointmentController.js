import Appointment from '../models/Appointment.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

// Patient — book a new appointment
export const bookAppointment = asyncHandler(async (req, res) => {
  const { phone, concern, department, date, time } = req.body;
  if (!phone || !concern || !department || !date || !time)
    throw new AppError('All fields are required', 400);

  const appointment = await Appointment.create({
    patientId:   req.user.id,
    patientName: req.body.name || 'Patient',
    phone, concern, department, date, time,
  });

  res.status(201).json({ success: true, data: appointment });
});

// Patient — get own appointments
export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patientId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: appointments });
});

// Patient — cancel own appointment
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, patientId: req.user.id });
  if (!appointment) throw new AppError('Appointment not found', 404);
  if (!['Pending', 'Upcoming'].includes(appointment.status))
    throw new AppError('Cannot cancel this appointment', 400);

  appointment.status = 'Cancelled';
  await appointment.save();
  res.json({ success: true, data: appointment });
});

// Admin/Doctor — get all appointments
export const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, doctorId, date } = req.query;
  const filter = {};
  if (status && status !== 'All')   filter.status = status;
  if (doctorId && doctorId !== 'All') filter.assignedDoctorId = doctorId;
  if (date) filter.date = date;

  const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: appointments });
});

// Admin/Doctor — update appointment (assign doctor, status, notes, timer)
export const updateAppointment = asyncHandler(async (req, res) => {
  const allowed = ['status', 'assignedDoctorId', 'assignedDoctorName', 'notes', 'consultationStart', 'consultationEnd', 'durationMinutes'];
  const changes = {};
  allowed.forEach(key => { if (key in req.body) changes[key] = req.body[key]; });

  // Convert empty string to null for ObjectId field
  if (changes.assignedDoctorId === '') changes.assignedDoctorId = null;

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { $set: changes },
    { new: true }
  );
  if (!appointment) throw new AppError('Appointment not found', 404);
  res.json({ success: true, data: appointment });
});
