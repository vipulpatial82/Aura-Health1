import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const aiHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    messages: [messageSchema],
    healthContextSnapshot: { type: mongoose.Schema.Types.Mixed }, // health data at time of chat
  },
  { timestamps: true }
);

// Keep only last 50 sessions per user
aiHistorySchema.index({ userId: 1, updatedAt: -1 });

aiHistorySchema.post('save', async function () {
  const count = await mongoose.model('AIHistory').countDocuments({ userId: this.userId });
  if (count > 50) {
    const oldest = await mongoose.model('AIHistory')
      .find({ userId: this.userId })
      .sort({ updatedAt: 1 })
      .limit(count - 50)
      .select('_id');
    await mongoose.model('AIHistory').deleteMany({ _id: { $in: oldest.map(d => d._id) } });
  }
});

export default mongoose.model('AIHistory', aiHistorySchema);
