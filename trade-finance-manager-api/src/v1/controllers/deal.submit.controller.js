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
const { sendDealSubmitEmails, sendAinMinAcknowledgement } = require('./send-deal-submit-emails');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');
const dealHasAllUkefIds = require('../helpers/dealHasAllUkefIds');

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

// Only create the TFM record until UKEFids have been generated, then process the submission
// This allows a deal in Pending state to be seen in TFM,
// which indicates to UKEF that a deal has been submitted before UKEFids are generated
const submitDealBeforeUkefIds = async (dealId, dealType) => {
  const deal = await getDeal(dealId, dealType);

  if (!deal) {
    console.error('TFM API - submitDealBeforeUkefIds - deal not found');
    return false;
  }

  return api.submitDeal(dealType, dealId);
};
exports.submitDealBeforeUkefIds = submitDealBeforeUkefIds;

/**
 * Following function is only triggered once
 * the number has been granted by the number generator
 * Azure function
 */
const submitDealAfterUkefIds = async (dealId, dealType, checker) => {
  const deal = await getDeal(dealId, dealType);

  console.log('UKEF IDs verified');

  if (!deal) {
    console.error('TFM API - submitDealAfterUkefIds - deal not found ', dealId);
    return false;
  }

  const submittedDeal = await api.submitDeal(dealType, dealId);

  const mappedDeal = mapSubmittedDeal(submittedDeal);

  const { submissionCount } = mappedDeal;

  const firstDealSubmission = submissionCount === 1;
  const dealHasBeenResubmit = submissionCount > 1;

  if (firstDealSubmission) {
    await updatePortalDealStatus(mappedDeal);

    const dealWithTfmData = await addTfmDealData(mappedDeal);

    const updatedDealWithPartyUrn = await addPartyUrns(dealWithTfmData);

    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPartyUrn);

    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithDealCurrencyConversions);

    const updatedDealWithCreateEstore = await createEstoreFolders(updatedDealWithUpdatedFacilities);

    if (mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      const updatedDealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      /**
       * Current requirement only allows AIN & MIN deals to be send to ACBS
       * This calls CREATES Deal & Facility ACBS records
       */
      const updatedDeal = await api.updateDeal(dealId, updatedDealWithTasks);
      if (dealController.canDealBeSubmittedToACBS(mappedDeal.submissionType)) {
        await dealController.submitACBSIfAllPartiesHaveUrn(dealId);
      }

      await sendDealSubmitEmails(updatedDealWithTasks);
      return updatedDeal;
    }

    return api.updateDeal(dealId, updatedDealWithCreateEstore);
  }

  if (dealHasBeenResubmit) {
    const { tfm: tfmDeal } = await findOneTfmDeal(dealId);

    const updatedDeal = await updatedIssuedFacilities(mappedDeal);

    /**
     * Current requirement only allows AIN & MIN deals to be send to ACBS
     * This call UPDATES facility record by updating their stage from
     * Unissued (06) to Issued (07)
     */
    if (dealController.canDealBeSubmittedToACBS(mappedDeal.submissionType)) {
      await acbsController.issueAcbsFacilities(updatedDeal);
    }

    if (shouldUpdateDealFromMIAtoMIN(mappedDeal, tfmDeal)) {
      const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, dealType, checker);

      // NOTE: this is the one and only time that TFM updates a snapshot.
      // Without this, it would involve additional API calls going around in circles.
      const { dealSnapshot } = await api.updateDealSnapshot(dealId, portalMINUpdate);

      updatedDeal.submissionType = dealSnapshot.submissionType;
      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
        updatedDeal.manualInclusionNoticeSubmissionDate = dealSnapshot.manualInclusionNoticeSubmissionDate;
        updatedDeal.checkerMIN = dealSnapshot.checkerMIN;
      } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        updatedDeal.manualInclusionNoticeSubmissionDate = dealSnapshot.details.manualInclusionNoticeSubmissionDate;
        updatedDeal.checkerMIN = dealSnapshot.details.checkerMIN;
      }
      if (dealController.canDealBeSubmittedToACBS(mappedDeal.submissionType)) {
        await dealController.submitACBSIfAllPartiesHaveUrn(dealId);
      }

      await sendAinMinAcknowledgement(updatedDeal);
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
  } = req.body;
  let deal;

  const canSubmitDealAfterUkefIds = await dealHasAllUkefIds(dealId);

  if (canSubmitDealAfterUkefIds) {
    deal = await submitDealAfterUkefIds(dealId, dealType);
  } else {
    deal = await submitDealBeforeUkefIds(dealId, dealType);
  }

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
