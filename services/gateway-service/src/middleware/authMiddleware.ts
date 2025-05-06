// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import config from '../configs/config';

declare global {
  namespace Express {
    interface Request { user?: string | jwt.JwtPayload; }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(
    token,
    config.JWT_SECRET,
    (err: VerifyErrors | null, payload: any) => {
      if (err) {
        const status = err.name === 'TokenExpiredError' ? 401 : 403;
        return res.status(status).json({ message: err.message });
      }
      req.user = payload;
      next();
    }
  );
}
