// src/routes/proxy.ts
import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../configs/config';

const router = Router();

// Explicit mapping of protected services
const services = [
  { path: '/cobot', target: config.COBOT_SERVICE_URL },
  { path: '/camera', target: config.CAMERA_SERVICE_URL },
  { path: '/predictor', target: config.PREDICTOR_SERVICE_URL },
  { path: '/data', target: config.DATA_SERVICE_URL },
  { path: '/labware', target: config.INTERFACE_SERVICE_URL }
];

services.forEach(({ path, target }) => {
  if (!target) {
    console.error(`Missing target URL for service at path ${path}`);
    return;
  }
  router.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      timeout: 15000,
      proxyTimeout: 15000
    })
  );
});

export default router;