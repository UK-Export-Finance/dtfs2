const {
  findOneTfmDeal,
  findOnePortalDeal,
  findOneGefDeal,
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
const { sendDealSubmitEmails, sendAinMinIssuedFacilitiesAcknowledgement } = require('./send-deal-submit-emails');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');

const getDeal = async (dealId, dealType) => {
  let deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    deal = await findOneGefDeal(dealId);
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    deal = await findOnePortalDeal(dealId);
  }

  return deal;
};

const submitDeal = async (dealId, dealType, checker) => {
  const deal = await getDeal(dealId, dealType);

  if (!deal) {
    return false;
  }

  const submittedDeal = await api.submitDeal(dealType, dealId);

  const mappedDeal = mapSubmittedDeal(submittedDeal);

  const { submissionCount } = mappedDeal;

  const firstDealSubmission = submissionCount === 1;
  const dealHasBeenResubmit = submissionCount > 1;

  if (firstDealSubmission) {
    await updatePortalDealStatus(mappedDeal);

    const updatedDealWithPartyUrn = await addPartyUrns(mappedDeal);

    const updatedDealWithProduct = await addDealProduct(updatedDealWithPartyUrn);

    const updatedDealWithPricingAndRisk = await addDealPricingAndRisk(updatedDealWithProduct);

    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPricingAndRisk);

    const updatedDealWithTfmDealStage = await addDealStageAndHistory(updatedDealWithDealCurrencyConversions);

    const updatedDealWithTfmDateReceived = await addDealDateReceived(updatedDealWithTfmDealStage);

    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithTfmDateReceived);

    const updatedDealWithCreateEstore = await createEstoreFolders(updatedDealWithUpdatedFacilities);

    if (mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      const updatedDealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      const updatedDeal = await api.updateDeal(dealId, updatedDealWithTasks);
      await sendDealSubmitEmails(updatedDealWithTasks);

      return updatedDeal;
    }

    return api.updateDeal(dealId, updatedDealWithCreateEstore);
  }

  if (dealHasBeenResubmit) {
    const { tfm: tfmDeal } = await findOneTfmDeal(dealId);

    const updatedDeal = await updatedIssuedFacilities(mappedDeal);

    if (mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN
    ) {
      await acbsController.issueAcbsFacilities(updatedDeal);
    }

    if (shouldUpdateDealFromMIAtoMIN(mappedDeal, tfmDeal)) {
      const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, checker);

      const { dealSnapshot } = await api.updateDealSnapshot(dealId, portalMINUpdate);

      updatedDeal.submissionType = dealSnapshot.details.submissionType;
      updatedDeal.manualInclusionNoticeSubmissionDate = dealSnapshot.details.manualInclusionNoticeSubmissionDate;
      updatedDeal.checkerMIN = dealSnapshot.details.checkerMIN;

      await dealController.submitACBSIfAllPartiesHaveUrn(dealId);

      await sendAinMinIssuedFacilitiesAcknowledgement(updatedDeal);
    }

    await updatePortalDealStatus(updatedDeal);

    return api.updateDeal(dealId, updatedDeal);
  }

  return api.updateDeal(dealId, submittedDeal);
};

exports.submitDeal = submitDeal;

const submitDealPUT = async (req, res) => {
  const {
    dealId,
    dealType,
    checker,
  } = req.body;

  const deal = await submitDeal(dealId, dealType, checker);

  if (!deal) {
    return res.status(404).send();
  }

  return res.status(200).send(deal);
};
exports.submitDealPUT = submitDealPUT;
