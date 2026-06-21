import { decodeJWTToken } from '../utils/helpers.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = decodeJWTToken(token);
  
  if (!decoded) {
    return res.status(401).json({ detail: 'Invalid or expired authentication token.' });
  }

  req.user = decoded;
  next();
};
