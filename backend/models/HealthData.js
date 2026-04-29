import mongoose from 'mongoose';

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  personalInfo: {
    fullName: { type: String },
    weight: { type: Number },
    height: { type: Number },
    age: { type: Number },
    bloodGroup: { type: String }
  },
  medicalInfo: {
    diabetes: { type: Number }, // Fasting Sugar
    hba1c: { type: Number },
    systolicBP: { type: Number },
    diastolicBP: { type: Number },
    restingHeartRate: { type: Number },
    oxygenSaturation: { type: Number },
    totalCholesterol: { type: Number },
    ldlCholesterol: { type: Number },
    hdlCholesterol: { type: Number },
    triglycerides: { type: Number },
    additionalNotes: { type: String },
    customFields: [{ name: String, value: String }],
    hiddenFields: [{ type: String }]
  },
  analysis: {
    healthRiskLevel: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Low' },
    healthScore: { type: Number },
    bmiValue: { type: Number },
    bmiStatus: { type: String },
    suggestedAction: { type: String },
    allRecommendations: [{ type: String }],
    detailedAnalysis: { type: mongoose.Schema.Types.Mixed },
    aiInsight: { type: String }
  }
}, {
  timestamps: true
});

export default mongoose.model('HealthData', healthDataSchema);