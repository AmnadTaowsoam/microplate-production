"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const config_1 = __importDefault(require("./configs/config"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const rateLimiter_1 = __importDefault(require("./middleware/rateLimiter"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(rateLimiter_1.default);
// Health
app.get('/health', (_req, res) => res.json({ status: 'OK' }));
// Auth (no JSON parser, raw body)
const authProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: config_1.default.AUTH_SERVICE_URL,
    changeOrigin: true,
});
app.use((req, res, next) => {
    if (req.path.startsWith(`${config_1.default.API_BASE_URL}/auth`)) {
        return authProxy(req, res, next);
    }
    next();
});
// จากนี้ลงหลัง auth-proxy: parse body + JWT
app.use(express_1.default.json());
app.use(config_1.default.API_BASE_URL, authMiddleware_1.authenticateToken);
// 1:1 Proxies for other services
app.use(`${config_1.default.API_BASE_URL}/cobot`, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: config_1.default.COBOT_SERVICE_URL, changeOrigin: true }));
app.use(`${config_1.default.API_BASE_URL}/camera`, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: config_1.default.CAMERA_SERVICE_URL, changeOrigin: true }));
app.use(`${config_1.default.API_BASE_URL}/predictor`, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: config_1.default.PREDICTOR_SERVICE_URL, changeOrigin: true }));
app.use(`${config_1.default.API_BASE_URL}/data`, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: config_1.default.DATA_SERVICE_URL, changeOrigin: true }));
app.use(`${config_1.default.API_BASE_URL}/labware`, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: config_1.default.INTERFACE_SERVICE_URL, changeOrigin: true }));
// Error handler
app.use(errorHandler_1.errorHandler);
app.listen(config_1.default.PORT, () => console.log(`Gateway listening on http://localhost:${config_1.default.PORT}${config_1.default.API_BASE_URL}`));
exports.default = app;
