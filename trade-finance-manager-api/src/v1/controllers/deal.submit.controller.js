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
const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const { updatePortalDealFromMIAtoMIN } = require('./update-portal-deal-from-MIA-to-MIN');

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
    const updatedDeal = await updatedIssuedFacilities(submittedDeal);

    if (deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
      await acbsController.issueAcbsFacilities(updatedDeal);
    }

    if (shouldUpdateDealFromMIAtoMIN(deal, tfmDeal)) {
      const minUpdate = await updatePortalDealFromMIAtoMIN(dealId, portalChecker);

      // add MIN details to TFM deal
      // updatedDeal.dealSnapshot.details = {
      //   ...updatedDeal.dealSnapshot.details,
      //   ...minUpdate,
      // };

      // TODO
      // issue is that central api doesn't allow snapshot to be changed.
      // how to do this... have dev chat (see slack)
      // :/
    }

    await updatePortalDealStatus(updatedDeal.dealSnapshot);

    return api.updateDeal(dealId, updatedDeal);
  }

  return api.updateDeal(dealId, submittedDeal);
};

exports.submitDeal = submitDeal;

const submitDealPUT = async (req, res) => {
  const {
    dealId,
    portalChecker,
  } = req.body;

  const dealInit = await submitDeal(dealId, portalChecker);

  if (!dealInit) {
    return res.status(404).send();
  }

  return res.status(200).send(dealInit);
};
exports.submitDealPUT = submitDealPUT;
