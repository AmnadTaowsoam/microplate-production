// services/auth-service/src/routes/index.ts
import { Router } from 'express';
import { DataSource } from 'typeorm';
import { createAuthRouter } from './authRoutes';

export function createApiRouter(dataSource: DataSource): Router {
  const mainRouter = Router();
  const authRouterInstance = createAuthRouter(dataSource);
  mainRouter.use('/api/v1/auth', authRouterInstance);

  return mainRouter;
}
