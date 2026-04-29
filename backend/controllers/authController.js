import * as authService from '../services/authService.js';
import { setAuthCookies, clearAuthCookies } from '../utils/tokenUtils.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { verifyFirebaseToken } from '../services/firebaseAdmin.js';

// Old register and login methods removed

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
  
  if (!idToken) {
    throw new AppError('ID token is required', 400);
  }

  // Verify the Firebase token
  const decodedToken = await verifyFirebaseToken(idToken);
  const { uid, email, name, picture } = decodedToken;

  // Find or create user
  let user = await User.findOne({ email });
  
  if (!user) {
    // Create new user for Firebase auth
    user = await User.create({
      name: providedName || name || email.split('@')[0],
      email,
      password: 'firebase-oauth', // Placeholder for Firebase users
      role: 'patient',
      isVerified: true,
      authProvider: 'firebase',
      firebaseUid: uid,
    });
  } else {
    // Update existing user with Firebase info
    user.firebaseUid = uid;
    user.authProvider = 'firebase';
    user.lastLogin = new Date();
    await user.save();
  }

  // Generate tokens
  const accessToken = authService.generateAccessToken(user._id);
  const refreshToken = authService.generateRefreshToken();

  // Save refresh token
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
