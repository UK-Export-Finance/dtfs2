import express from 'express';
import caseRoutes from './case';

const router = express.Router();

router.use('/', caseRoutes);


export default router;
