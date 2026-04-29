import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, default: 'General Physician' },
  experience:     { type: Number, default: 0 },
  workingHours:   { type: String, default: '9:00 AM - 5:00 PM' },
  totalPatients:  { type: Number, default: 0 },
  rating:         { type: Number, default: 0 },
  isAvailable:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
