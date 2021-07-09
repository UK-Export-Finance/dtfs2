const {
  findOneDeal,
  findOnePortalDeal,
} = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const { createDealTasks } = require('./deal.tasks');
const { updateFacilities } = require('./update-facilities');
const { addDealProduct } = require('./deal.add-product');
const { addDealPricingAndRisk } = require('./deal.pricing-and-risk');
const { convertDealCurrencies } = require('./deal.convert-deal-currencies');
const { addDealStageAndHistory } = require('./deal.add-deal-stage-and-history');
const { addDealDateReceived } = require('./deal.add-date-received');
const { updatedIssuedFacilities } = require('./update-issued-facilities');
const { updatePortalDealStatus } = require('./update-portal-deal-status');
const CONSTANTS = require('../../constants');
const api = require('../api');
const { createEstoreFolders } = require('./estore.controller');
const acbsController = require('./acbs.controller');
const dealController = require('./deal.controller');
const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const { updatePortalDealFromMIAtoMIN } = require('./update-portal-deal-from-MIA-to-MIN');
const { sendDealSubmitEmails, sendAinMinIssuedFacilitiesAcknowledgementByDealId } = require('./send-deal-submit-emails');

const submitDeal = async (dealId, portalChecker, urlOrigin) => {
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

    const updatedDealWithProduct = await addDealProduct(updatedDealWithPartyUrn);

    const updatedDealWithPricingAndRisk = await addDealPricingAndRisk(updatedDealWithProduct);

    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPricingAndRisk);

    const updatedDealWithTfmDealStage = await addDealStageAndHistory(updatedDealWithDealCurrencyConversions);

    const updatedDealWithTfmDateReceived = await addDealDateReceived(updatedDealWithTfmDealStage);

    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithTfmDateReceived);

    const updatedDealWithCreateEstore = await createEstoreFolders(updatedDealWithUpdatedFacilities);

    if (portalDeal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || portalDeal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      const updatedDealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      await sendDealSubmitEmails(updatedDealWithTasks, urlOrigin);

      const updatedDeal = api.updateDeal(dealId, updatedDealWithTasks);
      return updatedDeal;
    }

    return api.updateDeal(dealId, updatedDealWithCreateEstore);
  }

  if (dealHasBeenResubmit) {
    const updatedDeal = await updatedIssuedFacilities(submittedDeal);

    if (portalDeal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || portalDeal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN
    ) {
      await acbsController.issueAcbsFacilities(updatedDeal);
    }

    if (shouldUpdateDealFromMIAtoMIN(portalDeal, tfmDeal)) {
      const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, portalChecker);

      const { dealSnapshot } = await api.updateDealSnapshot(dealId, portalMINUpdate);

      await dealController.submitACBSIfAllPartiesHaveUrn(dealId);

      await sendAinMinIssuedFacilitiesAcknowledgementByDealId(dealId);

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

  const { origin: urlOrigin } = req.headers;

  const dealInit = await submitDeal(dealId, portalChecker, urlOrigin);

  if (!dealInit) {
    return res.status(404).send();
  }

  return res.status(200).send(dealInit);
};
exports.submitDealPUT = submitDealPUT;
