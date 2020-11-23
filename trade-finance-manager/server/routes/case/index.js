import express from 'express';
import caseController from '../../controllers/case';

const router = express.Router();

router.get('/case/deal/:_id', caseController.getCaseDeal);

export default router;
