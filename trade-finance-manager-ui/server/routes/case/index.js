import express from 'express';
import caseController from '../../controllers/case';

const router = express.Router();

router.get('/deal/:_id', caseController.getCaseDeal);

router.get('/facility/:_id', caseController.getCaseFacility);

router.get('/parties/:_id', caseController.getCaseParties);

router.get('/parties/:_id/exporter', caseController.getPartyDetails('exporter'));
router.get('/parties/:_id/buyer', caseController.getPartyDetails('buyer'));
router.get('/parties/:_id/agent', caseController.getPartyDetails('agent'));
router.get('/parties/:_id/indemnifier', caseController.getPartyDetails('indemnifier'));
router.get('/parties/:_id/bond-issuer', caseController.getBondIssuerPartyDetails);

export default router;
