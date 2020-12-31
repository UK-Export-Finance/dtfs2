import express from 'express';
import caseController from '../../controllers/case';

const router = express.Router();

router.get('/deal/:_id', caseController.getCaseDeal);

router.get('/parties/:_id', caseController.getCaseParties);

export default router;
