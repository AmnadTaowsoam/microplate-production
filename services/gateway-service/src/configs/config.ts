// services/auth-service/src/configs/config.ts
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../../.env.common') });
dotenv.config({ path: join(__dirname, '../../.env.gateway') });

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var ${key}`);
  return v;
}

export default {
  PORT: Number(process.env.PORT) || 3100,
  API_BASE_URL: required('API_BASE_URL'),

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  JWT_SECRET: required('JWT_SECRET_KEY'),

  AUTH_SERVICE_URL: required('AUTH_SERVICE_URL'),
  COBOT_SERVICE_URL: required('COBOT_SERVICE_URL'),
  CAMERA_SERVICE_URL: required('CAMERA_SERVICE_URL'),
  PREDICTOR_SERVICE_URL: required('PREDICTOR_SERVICE_URL'),
  DATA_SERVICE_URL: required('DATA_SERVICE_URL'),
  INTERFACE_SERVICE_URL: required('INTERFACE_SERVICE_URL')
};
