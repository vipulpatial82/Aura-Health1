import * as authService from '../services/authService.js';
import { setAuthCookies, clearAuthCookies, generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { verifyFirebaseToken } from '../services/firebaseAdmin.js';

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refreshAccessToken(token);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken } });
});

export const logout = asyncHandler(async (req, res) => {
  try { await authService.logoutUser(req.user.id); } catch {}
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);
  res.json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new AppError('User not found', 404);

  if (name) user.name = name.trim();

  if (newPassword) {
    if (!currentPassword) throw new AppError('Current password is required', 400);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AppError('Current password is incorrect', 401);
    user.password = await bcrypt.hash(newPassword, 12);
  }

  await user.save();
  res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken, name: providedName } = req.body;

  if (!idToken) throw new AppError('ID token is required', 400);

  const decodedToken = await verifyFirebaseToken(idToken);
  const uid = decodedToken.uid;
  const email = decodedToken.email;
  const decodedName =
    decodedToken.name ||
    decodedToken.displayName ||
    decodedToken.firebase?.identities?.name?.[0] ||
    '';

  if (!email) throw new AppError('Firebase token does not contain an email', 400);

  const adminEmail = process.env.ADMIN_EMAIL || 'doctor@aurahealth.com';
  const doctorEmails = (process.env.DOCTOR_EMAILS || 'dr.sarah@aurahealth.com')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  let role = 'patient';
  const emailLower = email.toLowerCase();

  if (emailLower === adminEmail.toLowerCase()) {
    role = 'admin';
  } else if (doctorEmails.includes(emailLower)) {
    role = 'doctor';
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: providedName || decodedName || email.split('@')[0],
      email,
      password: 'firebase-oauth',
      role,
      isVerified: true,
      authProvider: 'firebase',
      firebaseUid: uid,
    });
  } else {
    if (!user.name || user.name === email.split('@')[0]) {
      user.name = providedName || user.name || decodedName || email.split('@')[0];
    }
    user.firebaseUid = uid;
    user.authProvider = 'firebase';
    user.lastLogin = new Date();
    await user.save();
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();

  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
  });
});

export const localLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);

  const adminEmail = process.env.ADMIN_EMAIL || 'doctor@aurahealth.com';
  const seedPassword = process.env.SEED_PASSWORD || 'Doctor@123';

  if (email.toLowerCase() === adminEmail.toLowerCase() && password === seedPassword) {
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      user = await User.create({
        name: 'Dr. Sarah',
        email: email.toLowerCase(),
        password: 'local-admin',
        role: 'admin',
        isVerified: true,
        authProvider: 'local'
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();

    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.lastLogin = new Date();
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  }

  const result = await authService.loginUser(email.toLowerCase(), password);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true, data: result });
});

export const localRegister = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const result = await authService.registerUser({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(201).json({ success: true, data: result });
});