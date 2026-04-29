import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Re-export for use in authController
export { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

// Seed default doctor and admin accounts on first run
export const seedDefaultAccounts = async () => {
  const defaultPassword = process.env.SEED_PASSWORD || 'Doctor@123';
  const adminEmail      = process.env.ADMIN_EMAIL    || 'doctor@aurahealth.com';

  // Admin account
  const adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    const hashed = await bcrypt.hash(defaultPassword, 12);
    await User.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin' });
  } else {
    const hashed = await bcrypt.hash(defaultPassword, 12);
    await User.updateOne({ email: adminEmail }, { $set: { role: 'admin', password: hashed } });
  }

  // Seed one default doctor so appointment assignment works
  const doctorEmail = 'dr.sarah@aurahealth.com';
  let doctorUser = await User.findOne({ email: doctorEmail });
  if (!doctorUser) {
    const hashed = await bcrypt.hash(defaultPassword, 12);
    doctorUser = await User.create({ name: 'Dr. Sarah Jenkins', email: doctorEmail, password: hashed, role: 'doctor' });
  }
  const Doctor = (await import('../models/Doctor.js')).default;
  const doctorExists = await Doctor.findOne({ userId: doctorUser._id });
  if (!doctorExists) {
    await Doctor.create({ userId: doctorUser._id, specialization: 'General Physician', experience: 10, workingHours: '9:00 AM - 5:00 PM', isAvailable: true });
  }
};

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('An account with this email already exists', 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const refreshToken = generateRefreshToken();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    refreshToken,
    refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = generateAccessToken(user._id);

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select(
    '+password +loginAttempts +lockUntil +refreshToken'
  );

  if (!user) throw new AppError('Invalid credentials', 401);

  // Check account lock
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new AppError(`Account locked. Try again in ${minutesLeft} minute(s).`, 423);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const attempts = user.loginAttempts + 1;
    const update = { loginAttempts: attempts };
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      update.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      update.loginAttempts = 0;
    }
    await User.findByIdAndUpdate(user._id, update);
    throw new AppError('Invalid credentials', 401);
  }

  // Successful login — rotate refresh token
  const refreshToken = generateRefreshToken();
  const accessToken = generateAccessToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    refreshToken,
    refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: new Date(),
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw new AppError('Refresh token required', 401);

  const user = await User.findOne({ refreshToken: incomingRefreshToken }).select(
    '+refreshToken +refreshTokenExpiry'
  );

  if (!user || user.refreshTokenExpiry.getTime() < Date.now()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Rotate: issue new refresh token on every use
  const newRefreshToken = generateRefreshToken();
  const newAccessToken = generateAccessToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    refreshToken: newRefreshToken,
    refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null, refreshTokenExpiry: null });
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new AppError('User not found', 404);
  return user;
};
