// src/routes/proxy.ts
import { Router } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from '../configs/config';

const router = Router();

// Helper to build a proxy for a given base path and target URL
function proxyTo(path: string, target: string, extraOpts: Partial<Options> = {}) {
  return createProxyMiddleware(path, {
    target,
    changeOrigin: true,
    // If your services define routes starting at '/', but you want to strip the prefix:
    // pathRewrite: { [`^${path}`]: '' },
    ...extraOpts,
  });
}

// 1. Auth Service (signup/login/refresh/me)
router.use(
  '/api/v1/auth',
  proxyTo('/api/v1/auth', config.services.auth)
);

// 2. cobot-service
router.use(
  '/api/v1/cobot',
  proxyTo('/api/v1/cobot', config.services.cobot)
);

// 3. camera-service
router.use(
  '/api/v1/camera',
  proxyTo('/api/v1/camera', config.services.camera)
);

// 4. predictor-service
router.use(
  '/api/v1/predictor',
  proxyTo('/api/v1/predictor', config.services.predictor)
);

// 5. data-service
router.use(
  '/api/v1/data',
  proxyTo('/api/v1/data', config.services.data)
);

// 6. interface-service
router.use(
  '/api/v1/interface',
  proxyTo('/api/v1/interface', config.services.interface)
);


export default router;
