import express from 'express';
import caseController from '../../controllers/case';

const router = express.Router();

router.get('/:_id/deal', caseController.getCaseDeal);

router.get('/:_id/facility/:facilityId', caseController.getCaseFacility);

router.get('/:_id/parties', caseController.getCaseParties);

router.get('/:_id/parties/exporter', caseController.getPartyDetails('exporter'));
router.post('/:_id/parties/exporter', caseController.postPartyDetails('exporter'));

router.get('/:_id/parties/buyer', caseController.getPartyDetails('buyer'));
router.post('/:_id/parties/buyer', caseController.postPartyDetails('buyer'));

router.get('/:_id/parties/agent', caseController.getPartyDetails('agent'));
router.post('/:_id/parties/agent', caseController.postPartyDetails('agent'));

router.get('/:_id/parties/indemnifier', caseController.getPartyDetails('indemnifier'));
router.post('/:_id/parties/indemnifier', caseController.postPartyDetails('indemnifier'));

router.get('/:_id/parties/bond-issuer', caseController.getBondIssuerPartyDetails);
router.post('/:_id/parties/bond-issuer', caseController.postTfmFacility);

router.get('/:_id/parties/bond-beneficiary', caseController.getBondBeneficiaryrPartyDetails);
router.post('/:_id/parties/bond-beneficiary', caseController.postTfmFacility);


export default router;
