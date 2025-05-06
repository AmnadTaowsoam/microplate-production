"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaceProxyOptions = exports.dataProxyOptions = exports.predictorProxyOptions = exports.cameraProxyOptions = exports.cobotProxyOptions = exports.authProxyOptions = void 0;
const config_1 = __importDefault(require("../configs/config"));
const baseOptions = {
    changeOrigin: true,
    secure: false,
    logLevel: 'debug'
};
const create = (target) => ({
    ...baseOptions,
    target,
    onProxyReq(proxyReq, req) {
        if (req.ip)
            proxyReq.setHeader('X-Forwarded-For', req.ip);
    }
});
exports.authProxyOptions = create(config_1.default.AUTH_SERVICE_URL);
exports.cobotProxyOptions = create(config_1.default.COBOT_SERVICE_URL);
exports.cameraProxyOptions = create(config_1.default.CAMERA_SERVICE_URL);
exports.predictorProxyOptions = create(config_1.default.PREDICTOR_SERVICE_URL);
exports.dataProxyOptions = create(config_1.default.DATA_SERVICE_URL);
exports.interfaceProxyOptions = create(config_1.default.INTERFACE_SERVICE_URL);
