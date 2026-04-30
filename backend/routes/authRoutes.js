import express from 'express';
import { refresh, logout, getProfile, updateProfile, firebaseLogin, localLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);


router.post('/firebase-login', authLimiter, firebaseLogin);
router.post('/login', authLimiter, localLogin);

export default router;
