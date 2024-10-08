const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { HttpStatusCode } = require('axios');
const { findOneDeal, updateDeal } = require('./deal.controller');
const { addComment } = require('./deal-comments.controller');
const { userHasAccessTo } = require('../users/checks');
const validateStateChange = require('../validation/deal-status');
const userCanSubmitDeal = require('./deal-status/user-can-submit-deal');
const updateStatus = require('./deal-status/update-status');
const createSubmissionDate = require('./deal-status/create-submission-date');
const createMiaSubmissionDate = require('./deal-status/create-mia-submission-date');
const updateSubmissionCount = require('./deal-status/update-submission-count');
const sendStatusUpdateEmails = require('./deal-status/send-status-update-emails');
const createApprovalDate = require('./deal-status/create-approval-date');
const updateFacilityCoverStartDates = require('./deal-status/update-facility-cover-start-dates');
const updateIssuedFacilities = require('./deal-status/update-issued-facilities');
const updateSubmittedIssuedFacilities = require('./deal-status/update-submitted-issued-facilities');
const createUkefIds = require('./deal-status/create-ukef-ids');
const api = require('../api');
const CONSTANTS = require('../../constants');

/**
 * Finds a specific deal by its ID and sends the deal's status as the response.
 * @param {Request} req - The request object containing the parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Response} - Response with status code, if Ok then with deal status
 */
exports.findOne = async (req, res) => {
  try {
    const deal = await findOneDeal(req.params.id);

    if (!deal) {
      return res.status(HttpStatusCode.NotFound).send();
    }

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(HttpStatusCode.Unauthorized).send();
    }

    return res.status(HttpStatusCode.Ok).send(deal.status);
  } catch (error) {
    console.error('❌ Unable to find deal %s %o', req.params.id, error);
    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'Unable to find deal' });
  }
};

/**
 * Updates the status of a deal based on the new status provided in the request body.
 * @param {Response} req - The request object.
 * @param {Request} res - The response object.
 * @returns {Promise<Response>} - The latest deal information.
 */
exports.update = async (req, res) => {
  const {
    user,
    params: { id: dealId },
    body,
  } = req;
  const auditDetails = generatePortalAuditDetails(user._id);
  const newStatus = body.status;

  try {
    const deal = await findOneDeal(dealId);

    if (!deal) {
      return res.status(HttpStatusCode.NotFound).send();
    }

    if (!userHasAccessTo(user, deal)) {
      return res.status(HttpStatusCode.Unauthorized).send();
    }

    const currentStatus = deal.status;

    console.info('Updating portal deal %s status from %s to %s', dealId, currentStatus, newStatus);

    if (newStatus !== CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL && newStatus !== CONSTANTS.DEAL.DEAL_STATUS.ABANDONED) {
      if (!userCanSubmitDeal(deal, user)) {
        return res.status(HttpStatusCode.Unauthorized).send();
      }
    }

    const validationErrors = await validateStateChange(deal, body, user);

    if (validationErrors) {
      return res.status(HttpStatusCode.Ok).send({
        success: false,
        ...validationErrors,
      });
    }

    let updatedDeal = await updateStatus(dealId, currentStatus, newStatus, auditDetails);

    // First submission of the deal to the checker
    if (currentStatus === CONSTANTS.DEAL.DEAL_STATUS.DRAFT && newStatus === CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL) {
      await updateFacilityCoverStartDates(user, updatedDeal, auditDetails);
    }

    // Add a comment to the deal
    if (body.comments) {
      updatedDeal = await addComment(dealId, body.comments, user, auditDetails);
    }

    // Update the deal
    if (newStatus !== CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED && newStatus !== CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF) {
      updatedDeal = await updateDeal({ dealId, updatedDeal, user, auditDetails });
    }

    // Subsequent submission of the deal to the checker
    if (newStatus === CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL) {
      const canUpdateIssuedFacilitiesCoverStartDates = true;
      const newIssuedFacilityStatus = 'Ready for check';

      updatedDeal = await updateIssuedFacilities(
        user,
        currentStatus,
        updatedDeal,
        canUpdateIssuedFacilitiesCoverStartDates,
        newIssuedFacilityStatus,
        auditDetails,
      );
    }

    // Send back the deal to the maker
    if (newStatus === CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED) {
      const newIssuedFacilityStatus = "Maker's input required";

      updatedDeal = await updateIssuedFacilities(user, currentStatus, updatedDeal, false, newIssuedFacilityStatus, auditDetails);
    }

    // Submit to UKEF / TFM
    if (newStatus === CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF) {
      console.info('Submit deal %s to UKEF', dealId);

      await updateSubmittedIssuedFacilities(user, updatedDeal, auditDetails);

      updatedDeal = await updateSubmissionCount(updatedDeal, user, auditDetails);

      if (!updatedDeal?.details?.submissionDate) {
        updatedDeal = await createSubmissionDate(dealId, user, auditDetails);
      }

      if (updatedDeal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA && !updatedDeal.details.manualInclusionApplicationSubmissionDate) {
        updatedDeal = await createMiaSubmissionDate(dealId, auditDetails);
      }

      if (updatedDeal?.details?.submissionCount === 1) {
        updatedDeal = await createUkefIds(updatedDeal, user, auditDetails);
      }

      await api.tfmDealSubmit(dealId, CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS, user);
    }

    // UKEF Approval
    if (newStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS || newStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS) {
      updatedDeal = await createApprovalDate(dealId, auditDetails);
    }

    // Send status update emails
    if (newStatus !== currentStatus) {
      await sendStatusUpdateEmails(updatedDeal, currentStatus, user);
    }

    const dealLatest = await findOneDeal(dealId);

    return res.status(HttpStatusCode.Ok).send(dealLatest);
  } catch (error) {
    console.error('❌ Unable to update the deal %o', error);
    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'Unable to update the deal' });
  }
};
