import express from 'express';
import caseController from '../../controllers/case';


const router = express.Router();

router.get('/:_id/deal', caseController.getCaseDeal);

router.get('/:_id/tasks', caseController.getCaseTasks);
router.post('/:_id/tasks', caseController.filterCaseTasks);

router.get('/:_id/tasks/:groupId/:taskId', caseController.getCaseTask);
router.post('/:_id/tasks/:groupId/:taskId', caseController.putCaseTask);

router.get('/:_id/facility/:facilityId', caseController.getCaseFacility);

router.get('/:_id/parties', caseController.getCaseParties);

router.get('/:_id/parties/exporter', caseController.getExporterPartyDetails);
router.post('/:_id/parties/exporter', caseController.postExporterPartyDetails);

router.get('/:_id/parties/buyer', caseController.getBuyerPartyDetails);
router.post('/:_id/parties/buyer', caseController.postBuyerPartyDetails);

router.get('/:_id/parties/agent', caseController.getAgentPartyDetails);
router.post('/:_id/parties/agent', caseController.postAgentPartyDetails);

router.get('/:_id/parties/indemnifier', caseController.getIndemnifierPartyDetails);
router.post('/:_id/parties/indemnifier', caseController.postIndemnifierPartyDetails);

router.get('/:_id/parties/bond-issuer', caseController.getBondIssuerPartyDetails);
router.post('/:_id/parties/bond-issuer', caseController.postTfmFacility);

router.get('/:_id/parties/bond-beneficiary', caseController.getBondBeneficiaryPartyDetails);
router.post('/:_id/parties/bond-beneficiary', caseController.postTfmFacility);

router.get('/:_id/underwriting/pricing-and-risk', caseController.getUnderWritingPricingAndRisk);
router.get('/:_id/underwriting/pricing-and-risk/edit', caseController.getUnderWritingPricingAndRiskEdit);
router.post('/:_id/underwriting/pricing-and-risk/edit', caseController.postUnderWritingPricingAndRisk);


export default router;
