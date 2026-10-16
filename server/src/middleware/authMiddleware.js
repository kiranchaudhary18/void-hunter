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

// Admin only middleware
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin clearance required' });
  }
};
