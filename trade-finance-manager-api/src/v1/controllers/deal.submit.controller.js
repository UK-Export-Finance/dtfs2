const {
  findOneDeal,
  findOnePortalDeal,
} = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const { createDealTasks } = require('./deal.tasks');
const { updateFacilities } = require('./update-facilities');
const { addDealPricingAndRisk } = require('./deal.pricing-and-risk');
const { convertDealCurrencies } = require('./deal.convert-deal-currencies');
const { addDealStageAndHistory } = require('./deal.add-deal-stage-and-history');
const { updatedIssuedFacilities } = require('./update-issued-facilities');
const { updatePortalDealStatus } = require('./update-portal-deal-status');
const CONSTANTS = require('../../constants');
const api = require('../api');
const { createEstoreFolders } = require('./estore.controller');
const acbsController = require('./acbs.controller');

const submitDeal = async (dealId, portalChecker) => {
  const deal = await findOnePortalDeal(dealId);

  if (!deal) {
    return false;
  }

  const { tfm: tfmDeal } = await findOneDeal(dealId);

  const { submissionCount } = deal.details;

  const firstDealSubmission = submissionCount === 1;
  const dealHasBeenResubmit = submissionCount > 1;

  const submittedDeal = await api.submitDeal(dealId);

  if (firstDealSubmission) {
    await updatePortalDealStatus(deal);

    const updatedDealWithPartyUrn = await addPartyUrns(submittedDeal);

    const updatedDealWithPricingAndRisk = await addDealPricingAndRisk(updatedDealWithPartyUrn);

    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPricingAndRisk);

    const updatedDealWithTfmDealStage = await addDealStageAndHistory(updatedDealWithDealCurrencyConversions);

    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithTfmDealStage);

    const updatedDealWithCreateEstore = await createEstoreFolders(updatedDealWithUpdatedFacilities);

    if (deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      const updatedDealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      return api.updateDeal(dealId, updatedDealWithTasks);
    }

    return api.updateDeal(dealId, updatedDealWithCreateEstore);
  }

  if (dealHasBeenResubmit) {
    const dealWithUpdatedFacilities = await updatedIssuedFacilities(submittedDeal);

    if (deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
      await acbsController.issueAcbsFacilities(dealWithUpdatedFacilities);
    }

    // update submission type
    if (deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      if (tfmDeal.underwriterManagersDecision) {
        if (tfmDeal.underwriterManagersDecision.decision === 'Approved (with conditions)'
          || tfmDeal.underwriterManagersDecision.decision === 'Approved (without conditions)') {

          const dealUpdate = {
            details: {
              submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
              checkerMIN: portalChecker,
              // manualInclusionNoticeSubmissionDate
            },
          };

          await api.updatePortalDeal(
            dealId,
            dealUpdate,
          );

          deal.details.submissionType = CONSTANTS.DEALS.SUBMISSION_TYPE.MIN;
        }
      }
    }

    await updatePortalDealStatus(deal);

    return api.updateDeal(dealId, dealWithUpdatedFacilities);
  }

  return api.updateDeal(dealId, submittedDeal);
};

exports.submitDeal = submitDeal;

const submitDealPUT = async (req, res) => {
  const {
    dealId,
    portalChecker,
  } = req.body;

  const dealInit = await submitDeal(dealId);

  if (!dealInit) {
    return res.status(404).send();
  }

  return res.status(200).send(dealInit);
};
exports.submitDealPUT = submitDealPUT;
