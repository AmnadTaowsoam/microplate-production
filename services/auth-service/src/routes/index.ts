// services/auth-service/src/routes/index.ts
import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

// Mount auth routes
router.use('/api/v1/auth', authRoutes);

export default router;

