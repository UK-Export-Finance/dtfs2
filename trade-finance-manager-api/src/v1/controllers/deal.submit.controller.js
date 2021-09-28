const {
  findOneTfmDeal,
  findOnePortalDeal,
  findOneGefDeal,
} = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const { createDealTasks } = require('./deal.tasks');
const { updateFacilities } = require('./update-facilities');
const { convertDealCurrencies } = require('./deal.convert-deal-currencies');

const addTfmDealData = require('./deal-add-tfm-data');
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

  console.log('TFM API getDeal ', dealId);

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    deal = await findOneGefDeal(dealId);
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    deal = await findOnePortalDeal(dealId);
  }

  return deal;
};

// Only create the TFM record until UKEFids have been generated, then process the submission
// This allows a deal in Pending state to be seen in TFM,
// which indicates to UKEF that a deal has been submitted before UKEFids are generated
const submitDealBeforeUkefIds = async (dealId, dealType) => {
  console.log('TFM API submitDealBeforeUkefIds called');

  const deal = await getDeal(dealId, dealType);

  console.log('TFM API submitDealBeforeUkefIds - deal ', deal);

  if (!deal) {
    console.error('TFM API submitDealBeforeUkefIds - deal not found');
    return false;
  }

  console.log('TFM API submitDealBeforeUkefIds calling api.submitDeal');

  return api.submitDeal(dealType, dealId);
};
exports.submitDealBeforeUkefIds = submitDealBeforeUkefIds;


const submitDealAfterUkefIds = async (dealId, dealType, checker) => {
  console.log('TFM API submitDealAfterUkefIds called');
  const deal = await getDeal(dealId, dealType);

  if (!deal) {
    console.error('TFM API submitDealAfterUkefIds - deal not found');
    return false;
  }

  const submittedDeal = await api.submitDeal(dealType, dealId);

  console.log('TFM API submitDealAfterUkefIds - calling mapSubmittedDeal');

  const mappedDeal = mapSubmittedDeal(submittedDeal);

  console.log('TFM API submitDealAfterUkefIds - got mappedDeal');

  const { submissionCount } = mappedDeal;

  const firstDealSubmission = submissionCount === 1;
  const dealHasBeenResubmit = submissionCount > 1;

  if (firstDealSubmission) {
    await updatePortalDealStatus(mappedDeal);

    const dealWithTfmData = await addTfmDealData(mappedDeal);

    const updatedDealWithPartyUrn = await addPartyUrns(dealWithTfmData);

    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPartyUrn);

    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithDealCurrencyConversions);

    let updatedDealWithCreateEstore = updatedDealWithUpdatedFacilities;

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      updatedDealWithCreateEstore = await createEstoreFolders(updatedDealWithUpdatedFacilities);
    }

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

      // NOTE: this is the one and only time that TFM updates a snapshot.
      // Without this, it would involve additional API calls going around in circles.
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

exports.submitDealAfterUkefIds = submitDealAfterUkefIds;

const submitDealPUT = async (req, res) => {
  const {
    dealId,
    dealType,
    checker,
  } = req.body;

  console.log('TFM API submitDealPUT ', req.body);

  const deal = await submitDealBeforeUkefIds(dealId, dealType, checker);

  if (!deal) {
    return res.status(404).send();
  }

  return res.status(200).send(deal);
};

exports.submitDealPUT = submitDealPUT;

const submitDealAfterUkefIdsPUT = async (req, res) => {
  const {
    dealId,
    dealType,
    checker,
  } = req.body;

  const deal = await submitDealAfterUkefIds(dealId, dealType, checker);

  if (!deal) {
    return res.status(404).send();
  }

  return res.status(200).send(deal);
};

exports.submitDealAfterUkefIdsPUT = submitDealAfterUkefIdsPUT;
