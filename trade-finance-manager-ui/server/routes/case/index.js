import express from 'express';
import caseController from '../../controllers/case';

const router = express.Router();

router.get('/deal/:_id', caseController.getCaseDeal);

router.get('/facility/:_id', caseController.getCaseFacility);

router.get('/parties/:_id', caseController.getCaseParties);

export default router;
