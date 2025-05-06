// services/data-service/src/routes/index.ts

import { Router } from 'express';
import rawPredictRouter from './rawPredict';
import imagesRouter from './images';
import resultsRouter from './results';
import interfaceResultsRouter from './interfaceResults';
import sampleSummaryRouter from './sampleSummary';

const router = Router();

// Mount each sub-router under its path
router.use('/raw-predict', rawPredictRouter);
router.use('/images',      imagesRouter);
router.use('/results',     resultsRouter);
router.use('/interface-results', interfaceResultsRouter);
router.use('/sample-summary', sampleSummaryRouter); 

export default router;
