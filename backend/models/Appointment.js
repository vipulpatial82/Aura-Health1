import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName:        { type: String, required: true },
  phone:              { type: String, required: true },
  concern:            { type: String, required: true },
  department:         { type: String, required: true },
  date:               { type: String, required: true },
  time:               { type: String, required: true },
  status:             { type: String, enum: ['Pending', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  assignedDoctorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  assignedDoctorName: { type: String, default: '' },
  notes:              { type: String, default: '' },
  consultationStart:  { type: Date, default: null },
  consultationEnd:    { type: Date, default: null },
  durationMinutes:    { type: Number, default: 0 },
}, { timestamps: true });

appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ status: 1 });

export default mongoose.model('Appointment', appointmentSchema);
