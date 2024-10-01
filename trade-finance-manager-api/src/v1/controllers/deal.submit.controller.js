const { ObjectId } = require('mongodb');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
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
const { issueAcbsFacilities, createACBS } = require('./acbs.controller');
const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const { updatePortalDealFromMIAtoMIN } = require('./update-portal-deal-from-MIA-to-MIN');
const { sendDealSubmitEmails, sendAinMinAcknowledgement } = require('./send-deal-submit-emails');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');
const { dealHasAllUkefIds } = require('../helpers/dealHasAllUkefIds');
const canSubmitToACBS = require('../helpers/can-submit-to-acbs');

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
const submitDealAfterUkefIds = async (dealId, dealType, checker, auditDetails) => {
  const deal = await getPortalDeal(dealId, dealType);

  if (!deal) {
    console.error('Unable to find deal %s upon submission to TFM', dealId);
    return false;
  }

  const submittedDeal = await api.submitDeal(dealType, dealId, auditDetails);
  const mappedDeal = mapSubmittedDeal(submittedDeal);

  const { submissionCount } = mappedDeal;
  const firstDealSubmission = submissionCount === 1;
  const dealHasBeenResubmit = submissionCount > 1;

  if (firstDealSubmission) {
    const acceptableTaskSubmissionTypes = [CONSTANTS.DEALS.SUBMISSION_TYPE.AIN, CONSTANTS.DEALS.SUBMISSION_TYPE.MIA];
    // Updates portal deal status
    await updatePortalDealStatus(mappedDeal, auditDetails);

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

    // TFM properties (deal.tfm)
    const dealWithTfmData = await addTfmDealData(updatedMappedDeal, auditDetails);
    const updatedDealWithPartyUrn = await addPartyUrns(dealWithTfmData, auditDetails);
    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPartyUrn, auditDetails);

    // Facilities
    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithDealCurrencyConversions, auditDetails);

    // Estore
    let dealUpdate = await createEstoreSite(updatedDealWithUpdatedFacilities);

    // TFM tasks
    if (acceptableTaskSubmissionTypes.includes(updatedMappedDeal.submissionType)) {
      dealUpdate = await createDealTasks(dealUpdate, auditDetails);
      const { firstTaskEmail } = await sendDealSubmitEmails(dealUpdate);

      /**
       * Add an emailSent flag to the first task.
       * This prevents multiple emails from being sent.
       */
      dealUpdate.tfm.tasks = addFirstTaskEmailSentFlag(firstTaskEmail, dealUpdate.tfm.tasks);
    }

    // Update the deal with all the above modifications
    const tfmDeal = api.updateDeal({ dealId, dealUpdate, auditDetails });

    // Submit to ACBS
    const canSubmitDealToACBS = await canSubmitToACBS(tfmDeal);

    if (canSubmitDealToACBS) {
      await createACBS(dealId);
    }

    return tfmDeal;
  }

  if (dealHasBeenResubmit) {
    let tfmDeal = await findOneTfmDeal(dealId);
    /**
     * checks if can update to MIN
     * if it can, changes mappedDeal to show MIN to allow gef fee record to be calculated
     * isUpdatingToMIN then also used to update deal to MIN
     */
    const isUpdatingToMIN = shouldUpdateDealFromMIAtoMIN(mappedDeal, tfmDeal.tfm);

    if (isUpdatingToMIN) {
      mappedDeal.submissionType = CONSTANTS.DEALS.SUBMISSION_TYPE.MIN;
      console.info('TFM deal %s submission type has been updated to %s', dealId, mappedDeal.submissionType);
    }

    // Update portal deal status
    await updatePortalDealStatus(mappedDeal, auditDetails);

    /**
     * Below action is performed to retrieve the latest portal application status.
     * Which should be changed to `Acknowledged` from `In Progress by UKEF` since
     * the application has been converted to MIN from MIA.
     *
     * Not fetching the latest portal deal status would cause TFM deal status to be
     * an `Application` rather than `Confirmed`.
     */

    const updatedPortalDeal = await getPortalDeal(dealId, dealType);
    const { status } = updatedPortalDeal;
    mappedDeal.status = status;

    // Update issued facilities
    const dealUpdate = await updatedIssuedFacilities(mappedDeal, auditDetails);

    if (isUpdatingToMIN) {
      const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, dealType, checker, auditDetails);

      /**
       * This is the one and only time that TFM updates a snapshot.
       * Without this, it would involve additional API calls going around in circles.
       */
      const { dealSnapshot } = await api.updateDealSnapshot(dealId, portalMINUpdate, auditDetails);

      dealUpdate.submissionType = dealSnapshot.submissionType;

      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
        dealUpdate.manualInclusionNoticeSubmissionDate = dealSnapshot.manualInclusionNoticeSubmissionDate;
        dealUpdate.checkerMIN = dealSnapshot.checkerMIN;
      } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        dealUpdate.manualInclusionNoticeSubmissionDate = dealSnapshot.details.manualInclusionNoticeSubmissionDate;
        dealUpdate.checkerMIN = dealSnapshot.details.checkerMIN;
      }

      await sendAinMinAcknowledgement(dealUpdate);

      // TFM deal stage should be updated to `Confirmed`
      const updatedDealStage = dealStage(mappedDeal.status, mappedDeal.submissionType);
      dealUpdate.tfm.stage = updatedDealStage;

      console.info('TFM deal %s stage has been updated to %s', dealId, updatedDealStage);
    }

    tfmDeal = await api.updateDeal({ dealId, dealUpdate, auditDetails });

    const canSubmitDealToACBS = await canSubmitToACBS(tfmDeal);

    if (canSubmitDealToACBS) {
      await createACBS(dealId);
    }

    const canIssueFacilityInACBS = await canSubmitToACBS(tfmDeal, false);

    if (canIssueFacilityInACBS) {
      await issueAcbsFacilities(dealUpdate);
    }

    return tfmDeal;
  }

  return api.updateDeal({ dealId, dealUpdate: submittedDeal, auditDetails });
};

exports.submitDealAfterUkefIds = submitDealAfterUkefIds;

/**
 * Submits a deal to TFM before the UKEF IDs are generated.
 * @param {string} dealId - The ID of the deal to be submitted.
 * @param {string} dealType - The type of the deal.
 * @param {Object} checker - checker submitting the deal
 * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - checker information
 * @returns {Promise<object | false> } - A promise that resolves to an object, other false.
 * @throws {Error} - If there is an error during the submission process.
 */
const submitDealBeforeUkefIds = async (dealId, dealType, checker, auditDetails) => {
  try {
    console.info('Submitting new deal %s to TFM', dealId);
    const deal = await getPortalDeal(dealId, dealType);

    if (!deal) {
      console.error('Deal does not exist in TFM, submitting new deal %s', dealId);
      return false;
    }

    const response = await api.submitDeal(dealType, dealId, auditDetails);

    if (!response) {
      throw new Error(`Unable to submit deal ${dealId} to TFM`);
    }

    return submitDealAfterUkefIds(dealId, dealType, checker, auditDetails);
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
// TODO: DTFS2-7112 this endpoint is obsolete and should be removed
const submitDealAfterUkefIdsPUT = async (req, res) => {
  try {
    const { dealId, dealType, checker } = req.body;

    if (!ObjectId.isValid(checker?._id)) {
      return res.status(400).send({ status: 400, message: 'Invalid checker _id' });
    }

    const deal = await submitDealAfterUkefIds(dealId, dealType, checker, generatePortalAuditDetails(checker._id));

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
 * @returns {Promise<object>} - The response object.
 */
const submitDealPUT = async (req, res) => {
  try {
    const { dealId, dealType, checker } = req.body;

    if (!dealId) {
      console.error('Invalid deal id provided %s', dealId);
      return res.status(400).send();
    }

    if (!ObjectId.isValid(checker?._id)) {
      console.error('Invalid checker id provided %s', checker?._id);
      return res.status(400).send();
    }

    const auditDetails = generatePortalAuditDetails(checker._id);

    const { status } = await dealHasAllUkefIds(dealId);
    let deal;

    if (status) {
      deal = await submitDealAfterUkefIds(dealId, dealType, checker, auditDetails);
    } else {
      deal = await submitDealBeforeUkefIds(dealId, dealType, checker, auditDetails);
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
