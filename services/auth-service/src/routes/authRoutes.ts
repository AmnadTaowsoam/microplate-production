// services/auth-service/src/routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { DataSource } from 'typeorm';

export function createAuthRouter(dataSource: DataSource) {
  const router = Router();
  const userRepo = dataSource.getRepository(User);
  const tokenRepo = dataSource.getRepository(RefreshToken);
  const authService = new AuthService(userRepo, tokenRepo);

  router.post('/signup', async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    try {
      const result = await authService.signup(email, name, password);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  });

  router.post('/refresh', async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    try {
      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  });

  return router;
}
