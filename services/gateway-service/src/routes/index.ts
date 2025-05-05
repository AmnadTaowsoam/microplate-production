// services\api-gateway\src\routes\index.ts
import { Router } from 'express';
import proxyRouter from './proxy';
// import otherRouters from './otherService';  // if needed in future

const router = Router();

// mount each sub-router
router.use(proxyRouter);

// router.use('/api/v1/other', otherRouter);

export default router;