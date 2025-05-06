"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/proxy.ts
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const config_1 = __importDefault(require("../configs/config"));
const router = (0, express_1.Router)();
// Explicit mapping of protected services
const services = [
    { path: '/cobot', target: config_1.default.COBOT_SERVICE_URL },
    { path: '/camera', target: config_1.default.CAMERA_SERVICE_URL },
    { path: '/predictor', target: config_1.default.PREDICTOR_SERVICE_URL },
    { path: '/data', target: config_1.default.DATA_SERVICE_URL },
    { path: '/labware', target: config_1.default.INTERFACE_SERVICE_URL }
];
services.forEach(({ path, target }) => {
    if (!target) {
        console.error(`Missing target URL for service at path ${path}`);
        return;
    }
    router.use(path, (0, http_proxy_middleware_1.createProxyMiddleware)({
        target,
        changeOrigin: true,
        secure: false,
        timeout: 15000,
        proxyTimeout: 15000
    }));
});
exports.default = router;
