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
const { createEstoreSite } = require('./estore.controller');
const acbsController = require('./acbs.controller');
const dealController = require('./deal.controller');
const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const { updatePortalDealFromMIAtoMIN } = require('./update-portal-deal-from-MIA-to-MIN');
const { sendDealSubmitEmails, sendAinMinAcknowledgement } = require('./send-deal-submit-emails');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');
const { dealHasAllUkefIds, dealHasAllValidUkefIds } = require('../helpers/dealHasAllUkefIds');

/**
 * Retrieves a deal from the portal based on the provided deal ID and deal type.
 * @param {string} dealId - The ID of the deal to retrieve from the portal.
 * @param {string} dealType - The type of the deal to retrieve from the portal.
 * @returns {Promise<object>} - The retrieved deal from the portal.
 */
const getPortalDeal = async (dealId, dealType) => {
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
  const deal = await getPortalDeal(dealId, dealType);
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
    // Updates portal deal status
    await updatePortalDealStatus(mappedDeal);

    /**
     * Below action is performed to retrieve the latest portal application status.
     * Which at the time of first fetch would have been changed to `Acknowledged`
     * if AIN/MIN from `Submitted`.
     *
     * Not fetching the latest portal deal status would cause TFM deal status to be
     * an `Application` rather than `Confirmed`.
     */

    const updatedPortalDeal = await getPortalDeal(dealId, dealType);
    const { status } = updatedPortalDeal;
    const updatedMappedDeal = {
      ...mappedDeal,
      status,
    };

    const dealWithTfmData = await addTfmDealData(updatedMappedDeal);
    const updatedDealWithPartyUrn = await addPartyUrns(dealWithTfmData);
    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPartyUrn);
    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithDealCurrencyConversions);
    const updatedDealWithCreateEstore = await createEstoreSite(updatedDealWithUpdatedFacilities);

    if (updatedMappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN || updatedMappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      const dealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      /**
       * Current requirement only allows AIN & MIN deals to be sent to ACBS
       * This calls CREATES Deal & Facility ACBS records
       */
      if (dealController.canDealBeSubmittedToACBS(updatedMappedDeal.submissionType) && dealHasAllValidUkefIds(dealId)) {
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

    // Update portal deal status
    await updatePortalDealStatus(mappedDeal);

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
 * @returns {Promise<Object> | Boolean} - A promise that resolves to an object, other false.
 * @throws {Error} - If there is an error during the submission process.
 */
const submitDealBeforeUkefIds = async (dealId, dealType, checker) => {
  try {
    console.info('Submitting new deal %s to TFM', dealId);
    const deal = await getPortalDeal(dealId, dealType);

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

/**
 * Handles a PUT request to submit a deal after validating the deal ID, deal type, and checker.
 * Calls the `submitDealAfterUkefIds` function to process the deal submission and returns the updated deal if successful.
 * @param {Object} req - The request object containing the request body with `dealId`, `dealType`, and `checker` properties.
 * @param {Object} res - The response object representing the response object with `status` and `send` methods.
 * @returns {Promise<Response>} A promise that resolves with the updated deal or rejects with an error.
 */
const submitDealAfterUkefIdsPUT = async (req, res) => {
  try {
    const { dealId, dealType, checker } = req.body;

    const deal = await submitDealAfterUkefIds(dealId, dealType, checker);

    if (!deal) {
      console.error('Deal does not exist in TFM %s', dealId);
      return res.status(404).send();
    }

    return res.status(200).send(deal);
  } catch (error) {
    console.error('❌ Unable to submit deal with IDs to TFM %o', error);
    return res.status(500).send();
  }
};

exports.submitDealAfterUkefIdsPUT = submitDealAfterUkefIdsPUT;

/**
 * Handles the submission of a deal to TFM (Trade Finance Manager).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object.
 */
const submitDealPUT = async (req, res) => {
  try {
    const { dealId, dealType, checker } = req.body;

    if (!dealId) {
      console.error('Invalid deal id provided %s', dealId);
      return res.status(400).send();
    }

    const { status } = await dealHasAllUkefIds(dealId);
    let deal;

    if (status) {
      deal = await submitDealAfterUkefIds(dealId, dealType, checker);
    } else {
      deal = await submitDealBeforeUkefIds(dealId, dealType, checker);
    }

    if (!deal) {
      console.error('Deal does not exist in TFM %s', dealId);
      return res.status(404).send();
    }

    return res.status(200).send(deal);
  } catch (error) {
    console.error('❌ Unable to update deal in TFM %o', error);
    return res.status(500).send();
  }
};

exports.submitDealPUT = submitDealPUT;
