import * as authService from '../services/authService.js';
import { setAuthCookies, clearAuthCookies } from '../utils/tokenUtils.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken } });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body.email, req.body.password);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken } });
});

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
