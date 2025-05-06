"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaceProxyOptions = exports.dataProxyOptions = exports.predictorProxyOptions = exports.cameraProxyOptions = exports.cobotProxyOptions = exports.authProxyOptions = void 0;
const config_1 = __importDefault(require("../configs/config")); // หรือ '@/configs/config'
const create = (serviceKey) => {
    const target = config_1.default[serviceKey];
    if (!target) {
        console.error(`[Proxy Service] Configuration error: Service URL for key "${serviceKey}" is missing or invalid.`);
        throw new Error(`Missing service URL configuration for ${serviceKey}`);
    }
    return {
        target,
        changeOrigin: true,
        secure: false,
        timeout: 15000,
        proxyTimeout: 15000,
    };
};
// ===== สร้างและ Export ตัว Options =====
exports.authProxyOptions = create('AUTH_SERVICE_URL');
exports.cobotProxyOptions = create('COBOT_SERVICE_URL');
exports.cameraProxyOptions = create('CAMERA_SERVICE_URL');
exports.predictorProxyOptions = create('PREDICTOR_SERVICE_URL');
exports.dataProxyOptions = create('DATA_SERVICE_URL');
exports.interfaceProxyOptions = create('INTERFACE_SERVICE_URL');
