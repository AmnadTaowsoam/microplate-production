// src/server.ts
import express from 'express';
import { config } from './configs/config';
import proxyRouter from './routes/proxy';
import { authenticate } from './middlewares/authMiddleware';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// 1) Parse JSON bodies
app.use(express.json());

// 2) Liveness probe
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 3) Secure & route all /api/v1 calls
app.use(
  '/api/v1',
  authenticate,   // JWT or x-api-key validation
  proxyRouter     // forward to downstream services
);

// 4) Catch-all error handler (must come last)
app.use(errorHandler);

// 5) Start server
const port = parseInt(config.port, 10);
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});