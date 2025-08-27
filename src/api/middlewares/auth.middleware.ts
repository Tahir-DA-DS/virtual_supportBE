import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  user: JwtPayload & { id: string; role: string; email: string };
}

export const authenticate: RequestHandler = (req, res, next) => {
  // Check JWT secret at runtime
  if (!JWT_SECRET) {
    res.status(500).json({ message: 'JWT configuration error' });
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      message: 'Authorization token missing or malformed',
      required: 'Bearer <token>'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token and cast to our expected type
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Validate decoded token structure
    if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.role) {
      res.status(403).json({ message: 'Invalid token structure' });
      return;
    }

    // Ensure the decoded token has the required properties
    const userData = decoded as JwtPayload & { id: string; role: string; email: string };
    
    (req as AuthenticatedRequest).user = userData;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      res.status(403).json({ message: 'Invalid token' });
    } else {
      res.status(403).json({ message: 'Token verification failed' });
    }
  }
};

export const authorizeRole = (role: 'student' | 'tutor' | 'admin') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || authReq.user.role !== role) {
      res.status(403).json({ 
        message: 'Forbidden: insufficient permissions',
        requiredRole: role,
        userRole: authReq.user?.role
      });
      return;
    }
    next();
  };
};