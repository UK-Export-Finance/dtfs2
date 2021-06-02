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
const dealController = require('./deal.controller');
const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const { updatePortalDealFromMIAtoMIN } = require('./update-portal-deal-from-MIA-to-MIN');
const { sendDealSubmitEmails } = require('./send-deal-submit-emails');

const submitDeal = async (dealId, portalChecker) => {
  const portalDeal = await findOnePortalDeal(dealId);

  if (!portalDeal) {
    return false;
  }

  const { tfm: tfmDeal } = await findOneDeal(dealId);

  const { submissionCount } = portalDeal.details;

  const firstDealSubmission = submissionCount === 1;
  const dealHasBeenResubmit = submissionCount > 1;

  const submittedDeal = await api.submitDeal(dealId);

  if (firstDealSubmission) {
    await updatePortalDealStatus(portalDeal);

    const updatedDealWithPartyUrn = await addPartyUrns(submittedDeal);

    const updatedDealWithPricingAndRisk = await addDealPricingAndRisk(updatedDealWithPartyUrn);

    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPricingAndRisk);

    const updatedDealWithTfmDealStage = await addDealStageAndHistory(updatedDealWithDealCurrencyConversions);

    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithTfmDealStage);

    const updatedDealWithCreateEstore = await createEstoreFolders(updatedDealWithUpdatedFacilities);

    if (portalDeal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || portalDeal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      const updatedDealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      await sendDealSubmitEmails(updatedDealWithTasks);

      const updatedDeal = api.updateDeal(dealId, updatedDealWithTasks);
      return updatedDeal;
    }

    // TODO: will need to do this with other tickets
    // await sendDealSubmitEmails(updatedDealWithCreateEstore);

    return api.updateDeal(dealId, updatedDealWithCreateEstore);
  }

  if (dealHasBeenResubmit) {
    const updatedDeal = await updatedIssuedFacilities(submittedDeal);

    if (portalDeal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
      await acbsController.issueAcbsFacilities(updatedDeal);
    }

    if (shouldUpdateDealFromMIAtoMIN(portalDeal, tfmDeal)) {
      const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, portalChecker);

      const { dealSnapshot } = await api.updateDealSnapshot(dealId, portalMINUpdate);

      await dealController.submitACBSIfAllPartiesHaveUrn(dealId);

      updatedDeal.dealSnapshot = dealSnapshot;
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
