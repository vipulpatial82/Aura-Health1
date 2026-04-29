import express from 'express';
import passport from 'passport';
import { register, login, refresh, logout, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { setAuthCookies } from '../utils/tokenUtils.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema), login);
router.post('/refresh',  refresh);
router.post('/logout',   protect, logout);
router.get('/profile',   protect, getProfile);
router.put('/profile',   protect, updateProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      const user = req.user;
      const accessToken  = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken();

      await User.findByIdAndUpdate(user._id, {
        refreshToken,
        refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(),
      });

      setAuthCookies(res, accessToken, refreshToken);

      const userData = encodeURIComponent(JSON.stringify({
        id: user._id, name: user.name, email: user.email, role: user.role,
      }));

      res.redirect(`${process.env.CLIENT_URL}/oauth/callback?user=${userData}`);
    } catch {
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

export default router;
