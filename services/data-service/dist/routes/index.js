"use strict";
// services/data-service/src/routes/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rawPredict_1 = __importDefault(require("./rawPredict"));
const images_1 = __importDefault(require("./images"));
const results_1 = __importDefault(require("./results"));
const interfaceResults_1 = __importDefault(require("./interfaceResults"));
const sampleSummary_1 = __importDefault(require("./sampleSummary"));
const router = (0, express_1.Router)();
// Mount each sub-router under its path
router.use('/raw-predict', rawPredict_1.default);
router.use('/images', images_1.default);
router.use('/results', results_1.default);
router.use('/interface-results', interfaceResults_1.default);
router.use('/sample-summary', sampleSummary_1.default);
exports.default = router;
