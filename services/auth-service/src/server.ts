// services/auth-service/src/server.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import { createAuthRouter } from './routes/authRoutes';
import { User } from './models/user.model';
import { RefreshToken } from './models/refreshToken.model';
import { DATABASE_URL, PORT } from './configs/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  schema: 'microplates',
  entities: [User, RefreshToken],
  synchronize: true,
});

AppDataSource.initialize()
  .then(() => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // ตอนนี้ DataSource พร้อมใช้งาน เราส่งเข้าไปให้ factory สร้าง router
    app.use('/api/v1/auth', createAuthRouter(AppDataSource));

    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error initializing data source', error);
    process.exit(1);
  });

