import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function auth(req, res, next) {
  console.log('Auth middleware: Attempting to verify token');
  const token = req.header('x-auth-token');

  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log('Auth middleware: Token verified, req.user populated:', req.user);
    next();
  } catch (err) {
    console.error('Auth middleware: Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

// Middleware for role-based authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

export { auth, authorizeRoles };
