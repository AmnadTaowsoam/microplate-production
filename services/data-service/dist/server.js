"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//services\data-service\src\server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./configs/config");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(','),
    credentials: process.env.CORS_ALLOW_CREDENTIALS === 'true'
}));
// ตรวจ token ก่อนเข้าถึงทุก endpoint ภายใต้ /api/v1/data
app.use('/api/v1/data', auth_1.authenticateToken, routes_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(config_1.PORT, () => console.log(`🚀 Data Service on port ${config_1.PORT}`));
