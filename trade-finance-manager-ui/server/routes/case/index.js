import express from 'express';
import caseController from '../../controllers/case';

const router = express.Router();

router.get('/deal/:_id', caseController.getCaseDeal);

export default router;
