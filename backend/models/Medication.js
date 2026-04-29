import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:    { type: String, required: true },
  dosage:  { type: String, default: '' },
  time:    { type: String, required: true },
  type:    { type: String, default: 'General' },
  status:  { type: String, enum: ['pending', 'taken'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Medication', medicationSchema);
