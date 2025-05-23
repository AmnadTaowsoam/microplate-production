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
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.options('*', cors());
app.use(morgan('dev'));
app.use(rateLimiter);

// 2) Health check
app.get('/health', (_req, res) => res.json({ status: 'OK' }));

// 3) Raw-body proxies for Auth & Predictor (bypass JSON parser)
const authProxy = createProxyMiddleware({
  target: config.AUTH_SERVICE_URL,
  changeOrigin: true,
  logLevel: 'debug',
});
const predictorProxy = createProxyMiddleware({
  target: config.PREDICTOR_SERVICE_URL,
  changeOrigin: true,
  logLevel: 'debug',
});
app.use((req, res, next) => {
  const p = req.path;
  if (p.startsWith(`${config.API_BASE_URL}/auth`))      return authProxy(req, res, next);
  if (p.startsWith(`${config.API_BASE_URL}/predictor`)) return predictorProxy(req, res, next);
  next();
});

// 4) JWT authentication for all /api/v1 routes
app.use((req, res, next) => {
  if (req.path.startsWith(config.API_BASE_URL)) {
    return authenticateToken(req, res, next);
  }
  next();
});

// 5) Proxy JSON-body services (forward raw body) BEFORE JSON parser
function makeRawProxy(target: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: 'debug',
    proxyTimeout: 120000,
  });
}
const cobotProxy   = makeRawProxy(config.COBOT_SERVICE_URL);
const cameraProxy  = makeRawProxy(config.CAMERA_SERVICE_URL);
const dataProxy    = makeRawProxy(config.DATA_SERVICE_URL);
const labwareProxy = makeRawProxy(config.INTERFACE_SERVICE_URL);
app.use((req, res, next) => {
  const p = req.path;
  if (p.startsWith(`${config.API_BASE_URL}/cobot`))   return cobotProxy(req, res, next);
  if (p.startsWith(`${config.API_BASE_URL}/camera`))  return cameraProxy(req, res, next);
  if (p.startsWith(`${config.API_BASE_URL}/data`))    return dataProxy(req, res, next);
  if (p.startsWith(`${config.API_BASE_URL}/labware`)) return labwareProxy(req, res, next);
  next();
});

// 6) Parse JSON for any direct routes (if needed)
app.use(express.json());

// 7) Error handler
app.use(errorHandler);

// 8) Start server
app.listen(config.PORT, () => {
  console.log(`Gateway listening on http://localhost:${config.PORT}${config.API_BASE_URL}`);
});

export default app;
