// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import config from '../configs/config';

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});

export default limiter;
