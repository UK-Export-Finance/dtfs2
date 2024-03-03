const { findOneTfmDeal, findOnePortalDeal, findOneGefDeal } = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const { createDealTasks } = require('./deal.tasks');
const addFirstTaskEmailSentFlag = require('./deal-add-tfm-data/add-first-task-email-sent-flag');
const { updateFacilities } = require('./update-facilities');
const { convertDealCurrencies } = require('./deal.convert-deal-currencies');

const addTfmDealData = require('./deal-add-tfm-data');
const dealStage = require('./deal-add-tfm-data/dealStage');
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
const { dealHasAllUkefIds, dealHasAllValidUkefIds } = require('../helpers/dealHasAllUkefIds');

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

/**
 * Following function is only triggered once
 * the number has been granted by the number generator
 * Azure function
 */
const submitDealAfterUkefIds = async (dealId, dealType, checker) => {
  const deal = await getDeal(dealId, dealType);
  console.info('Setting essential deal properties in TFM for deal %s', dealId);

  if (!deal) {
    console.error('Unable to find deal %s upon submission to TFM', dealId);
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

    if (mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN || mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      const dealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      /**
       * Current requirement only allows AIN & MIN deals to be sent to ACBS
       * This calls CREATES Deal & Facility ACBS records
       */
      if (dealController.canDealBeSubmittedToACBS(mappedDeal.submissionType) && dealHasAllValidUkefIds(dealId)) {
        await dealController.submitACBSIfAllPartiesHaveUrn(dealId);
      }

      const { firstTaskEmail } = await sendDealSubmitEmails(dealWithTasks);

      /**
       * Add an emailSent flag to the first task.
       * This prevents multiple emails from being sent.
       */
      const updatedDealWithTasks = dealWithTasks;
      updatedDealWithTasks.tfm.tasks = addFirstTaskEmailSentFlag(firstTaskEmail, dealWithTasks.tfm.tasks);

      /**
       * Update the deal with all the above modifications
       * Note: at the time of writing, some functions above update the deal, others do not.
       */
      return api.updateDeal(dealId, updatedDealWithTasks);
    }

    return api.updateDeal(dealId, updatedDealWithCreateEstore);
  }

  if (dealHasBeenResubmit) {
    const { tfm: tfmDeal } = await findOneTfmDeal(dealId);

    /**
     * checks if can update to MIN
     * if it can, changes mappedDeal to show MIN to allow gef fee record to be calculated
     * isUpdatingToMIN then also used to update deal to MIN
     */
    const isUpdatingToMIN = shouldUpdateDealFromMIAtoMIN(mappedDeal, tfmDeal);

    if (isUpdatingToMIN) {
      mappedDeal.submissionType = CONSTANTS.DEALS.SUBMISSION_TYPE.MIN;
      console.info('TFM deal %s submission type has been updated to %s', dealId, mappedDeal.submissionType);
    }
    const updatedDeal = await updatedIssuedFacilities(mappedDeal);
    /**
     * Current requirement only allows AIN & MIN deals to be send to ACBS
     * This call UPDATES facility record by updating their stage from
     * Unissued (06) to Issued (07)
     */
    if (dealController.canDealBeSubmittedToACBS(mappedDeal.submissionType) && dealHasAllValidUkefIds(dealId)) {
      await acbsController.issueAcbsFacilities(updatedDeal);
    }

    if (isUpdatingToMIN) {
      const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, dealType, checker);

      /**
       * This is the one and only time that TFM updates a snapshot.
       * Without this, it would involve additional API calls going around in circles.
       */
      const { dealSnapshot } = await api.updateDealSnapshot(dealId, portalMINUpdate);

      updatedDeal.submissionType = dealSnapshot.submissionType;

      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
        updatedDeal.manualInclusionNoticeSubmissionDate = dealSnapshot.manualInclusionNoticeSubmissionDate;
        updatedDeal.checkerMIN = dealSnapshot.checkerMIN;
      } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        updatedDeal.manualInclusionNoticeSubmissionDate = dealSnapshot.details.manualInclusionNoticeSubmissionDate;
        updatedDeal.checkerMIN = dealSnapshot.details.checkerMIN;
      }

      if (dealController.canDealBeSubmittedToACBS(portalMINUpdate.submissionType) && dealHasAllValidUkefIds(dealId)) {
        await dealController.submitACBSIfAllPartiesHaveUrn(dealId);
      }

      await sendAinMinAcknowledgement(updatedDeal);

      // TFM deal stage should be updated to `Confirmed`
      const updatedDealStage = dealStage(mappedDeal.status, mappedDeal.submissionType);
      updatedDeal.tfm.stage = updatedDealStage;

      console.info('TFM deal %s stage has been updated to %s', dealId, updatedDealStage);
    }
    await updatePortalDealStatus(updatedDeal);

    return api.updateDeal(dealId, updatedDeal);
  }
  return api.updateDeal(dealId, submittedDeal);
};

exports.submitDealAfterUkefIds = submitDealAfterUkefIds;

/**
 * Submits a deal to TFM before the UKEF IDs are generated.
 * @param {string} dealId - The ID of the deal to be submitted.
 * @param {string} dealType - The type of the deal.
 * @param {string} checker - The name of the checker.
 * @returns {Promise<Object>} - A promise that resolves to true if the submission is successful, false otherwise.
 * @throws {Error} - If there is an error during the submission process.
 */
const submitDealBeforeUkefIds = async (dealId, dealType, checker) => {
  try {
    console.info('Submitting new deal %s to TFM', dealId);
    const deal = await getDeal(dealId, dealType);

    if (!deal) {
      console.error('Deal does not exist in TFM, submitting new deal %s', dealId);
      return false;
    }

    const response = await api.submitDeal(dealType, dealId);

    if (!response) {
      throw new Error('Unable to submit deal %s to TFM', dealId);
    }

    return submitDealAfterUkefIds(dealId, dealType, checker);
  } catch (error) {
    console.error('❌ Unable to submit new deal %s to TFM %o', dealId, error);
    throw new Error('Unable to submit new deal to TFM');
  }
};
exports.submitDealBeforeUkefIds = submitDealBeforeUkefIds;

const submitDealPUT = async (req, res) => {
  const { dealId, dealType, checker } = req.body;
  let deal;

  if (dealId) {
    // Ensure all IDs are valid
    const { status } = await dealHasAllUkefIds(dealId);

    if (status) {
      deal = await submitDealAfterUkefIds(dealId, dealType, checker);
    } else {
      deal = await submitDealBeforeUkefIds(dealId, dealType, checker);
    }

    if (!deal) {
      return res.status(404).send();
    }

    return res.status(200).send(deal);
  }

  // Upon failure
  return res.status(400).send();
};

exports.submitDealPUT = submitDealPUT;

const submitDealAfterUkefIdsPUT = async (req, res) => {
  const { dealId, dealType, checker } = req.body;

  const deal = await submitDealAfterUkefIds(dealId, dealType, checker);

  if (!deal) {
    return res.status(404).send();
  }

  return res.status(200).send(deal);
};

exports.submitDealAfterUkefIdsPUT = submitDealAfterUkefIdsPUT;
