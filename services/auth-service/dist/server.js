"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
// services/auth-service/src/server.ts
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const authRoutes_1 = require("./routes/authRoutes");
const user_model_1 = require("./models/user.model");
const refreshToken_model_1 = require("./models/refreshToken.model");
const config_1 = require("./configs/config");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: config_1.DATABASE_URL,
    schema: 'microplates',
    entities: [user_model_1.User, refreshToken_model_1.RefreshToken],
    synchronize: true,
});
exports.AppDataSource.initialize()
    .then(() => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // ตอนนี้ DataSource พร้อมใช้งาน เราส่งเข้าไปให้ factory สร้าง router
    app.use('/api/v1/auth', (0, authRoutes_1.createAuthRouter)(exports.AppDataSource));
    app.listen(config_1.PORT, () => {
        console.log(`Auth service running on port ${config_1.PORT}`);
    });
})
    .catch((error) => {
    console.error('Error initializing data source', error);
    process.exit(1);
});
