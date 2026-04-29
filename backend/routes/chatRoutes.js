import express from 'express';
import { chat, getHistory } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import User from '../models/User.js';

const router = express.Router();

// Optional auth — attaches user if token present, never blocks guests
const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      const user = await User.findById(decoded.id).select('role');
      if (user) req.user = { id: decoded.id, role: user.role };
    }
  } catch {}
  next();
};

router.post('/', chatLimiter, optionalAuth, chat);
router.get('/history', protect, getHistory);

export default router;
