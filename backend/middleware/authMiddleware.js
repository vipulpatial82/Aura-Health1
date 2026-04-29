import { verifyAccessToken } from '../utils/tokenUtils.js';
import { AppError, asyncHandler } from '../middleware/errorMiddleware.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw new AppError('Not authorized — no token', 401);

  const decoded = verifyAccessToken(token);
  if (!decoded) throw new AppError('Not authorized — invalid token', 401);

  // Fetch user to get role
  const user = await User.findById(decoded.id).select('role');
  if (!user) throw new AppError('User not found', 401);

  req.user = { id: decoded.id, role: user.role };
  next();
});
