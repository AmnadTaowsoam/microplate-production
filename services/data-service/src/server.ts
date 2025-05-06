//services\data-service\src\server.ts
import express from 'express';
import cors from 'cors';
import { PORT } from './configs/config';
import dataRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(','),
  credentials: process.env.CORS_ALLOW_CREDENTIALS === 'true'
}));

// ตรวจ token ก่อนเข้าถึงทุก endpoint ภายใต้ /api/v1/data
app.use('/api/v1/data', authenticateToken, dataRouter);

app.use(errorHandler);

app.listen(PORT, () => 
  console.log(`🚀 Data Service on port ${PORT}`)
);
