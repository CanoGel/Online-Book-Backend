import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  const getToken = () => {
    // Check Authorization header first
    if (req.headers.authorization?.startsWith('Bearer')) {
      return req.headers.authorization.split(' ')[1];
    }
    // Fallback to cookies
    if (req.cookies?.token) {
      return req.cookies.token;
    }
    return null;
  };

  const token = getToken();

  if (!token) {
    return res.status(401).json({ 
      message: 'Not authorized', 
      code: 'NO_TOKEN' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found', 
        code: 'USER_NOT_FOUND',
        shouldLogout: true
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Error:', error.message);
    
    const response = {
      message: 'Not authorized',
      code: 'INVALID_TOKEN'
    };

    if (error.name === 'TokenExpiredError') {
      response.message = 'Session expired';
      response.code = 'TOKEN_EXPIRED';
      response.shouldLogout = true;
    }

    res.status(401).json(response);
  }
};

export const admin = (req, res, next) => {
  if (req.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ 
    message: 'Admin access required',
    code: 'ADMIN_REQUIRED' 
  });
};