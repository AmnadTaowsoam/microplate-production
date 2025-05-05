// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../configs/config';

export interface AuthRequest extends Request {
  user?: any;
  service?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const { authorization, 'x-api-key': apiKeyHdr } = req.headers as Record<string, string | undefined>;
  const isAuthRoute = req.path.startsWith('/api/v1/auth');

  // Public auth endpoints (signup, login, refresh)
  if (isAuthRoute) {
    return next();
  }

  // 1) Service-to-service: API key
  if (apiKeyHdr) {
    if (apiKeyHdr === config.apiKey) {
      req.service = 'internal';
      return next();
    }
    return res.status(403).json({ message: 'Invalid API key' });
  }

  // 2) User requests: JWT bearer token
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Bearer token or x-api-key header' });
  }

  const token = authorization.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

