import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/gameConfig.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Pilot account not found' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authorization token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }
};

// Admin only authorization middleware (Section 74: Restrict administrative access)
export const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role?.toLowerCase() === 'admin')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrator clearance required'
  });
};

export const authorizeAdmin = requireAdmin;

// Optional auth middleware (attaches req.user if present, but does not block)
export const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Non-blocking
    }
  }
  next();
};
