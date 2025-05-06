"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proxy_1 = __importDefault(require("./proxy"));
// import otherRouters from './otherService';  // if needed in future
const router = (0, express_1.Router)();
// mount each sub-router
router.use(proxy_1.default);
// router.use('/api/v1/other', otherRouter);
exports.default = router;
