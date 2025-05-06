// src/server.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

import config from './configs/config';
import { authenticateToken } from './middleware/authMiddleware';
import rateLimiter from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// 1) Global middleware
app.use(cors());
app.use(morgan('dev'));
app.use(rateLimiter);

// 2) Health check
app.get('/health', (_req, res) => res.json({ status: 'OK' }));

// 3) Raw‐body proxies for Auth & Predictor (no JSON parsing, no prefix stripping)
const authProxy      = createProxyMiddleware({ target: config.AUTH_SERVICE_URL,      changeOrigin: true });
const predictorProxy = createProxyMiddleware({ target: config.PREDICTOR_SERVICE_URL, changeOrigin: true });

app.use((req, res, next) => {
  const p = req.path;
  if (p.startsWith(`${config.API_BASE_URL}/auth`)) {
    return authProxy(req, res, next);
  }
  if (p.startsWith(`${config.API_BASE_URL}/predictor`)) {
    return predictorProxy(req, res, next);
  }
  next();
});

// 4) Now parse JSON and enforce JWT for ALL remaining /api/v1 routes
app.use(express.json());
app.use((req, res, next) => {
  if (req.path.startsWith(config.API_BASE_URL)) {
    return authenticateToken(req, res, next);
  }
  next();
});

// 5) Proxy the rest of your services (these expect JSON + JWT)
const cobotProxy   = createProxyMiddleware({ target: config.COBOT_SERVICE_URL,   changeOrigin: true });
const cameraProxy  = createProxyMiddleware({ target: config.CAMERA_SERVICE_URL,  changeOrigin: true });
const dataProxy    = createProxyMiddleware({ target: config.DATA_SERVICE_URL,    changeOrigin: true });
const labwareProxy = createProxyMiddleware({ target: config.INTERFACE_SERVICE_URL, changeOrigin: true });

app.use((req, res, next) => {
  const p = req.path;
  if (p.startsWith(`${config.API_BASE_URL}/cobot`))     return cobotProxy(req, res, next);
  if (p.startsWith(`${config.API_BASE_URL}/camera`))    return cameraProxy(req, res, next);
  if (p.startsWith(`${config.API_BASE_URL}/data`))      return dataProxy(req, res, next);
  if (p.startsWith(`${config.API_BASE_URL}/labware`))   return labwareProxy(req, res, next);
  next();
});

// 6) Error handler
app.use(errorHandler);

// 7) Start server
app.listen(config.PORT, () => {
  console.log(`Gateway listening on http://localhost:${config.PORT}${config.API_BASE_URL}`);
});

export default app;