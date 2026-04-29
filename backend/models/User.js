import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    refreshToken: { type: String, select: false },
    refreshTokenExpiry: { type: Date, select: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Index for refresh token lookups (email index already created by unique:true)
userSchema.index({ refreshToken: 1 });

userSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

export default mongoose.model('User', userSchema);
