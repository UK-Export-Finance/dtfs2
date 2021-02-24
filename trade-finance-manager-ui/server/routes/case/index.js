import express from 'express';
import caseController from '../../controllers/case';

const router = express.Router();

router.get('/:_id/deal', caseController.getCaseDeal);

router.get('/:_id/facility/:facilityId', caseController.getCaseFacility);

router.get('/:_id/parties', caseController.getCaseParties);

router.get('/:_id/parties/exporter', caseController.getPartyDetails('exporter'));
router.get('/:_id/parties/buyer', caseController.getPartyDetails('buyer'));
router.get('/:_id/parties/agent', caseController.getPartyDetails('agent'));
router.get('/:_id/parties/indemnifier', caseController.getPartyDetails('indemnifier'));
router.get('/:_id/parties/bond-issuer', caseController.getBondIssuerPartyDetails);

export default router;
