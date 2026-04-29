import { AppError } from './errorMiddleware.js';

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role || !roles.includes(req.user.role)) {
    return next(new AppError('Access denied — insufficient permissions', 403));
  }
  next();
};
