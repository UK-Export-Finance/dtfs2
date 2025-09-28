const CONSTANTS = require('../../constants');
const { validationErrorHandler } = require('../../utils/helpers');
const { isDealNotice } = require('../../utils/deal-helpers');
const { issuedFacilityConfirmation } = require('../../utils/facility-helpers');
const api = require('../../services/api');
const Application = require('../../models/application');

/**
 * Renders the submit to ukef page for a given deal.
 *
 * @async
 * @function submitToUkef
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Renders the appropriate Nunjucks template based on success or error.
 */
const submitToUkef = async (req, res) => {
  const { params } = req;
  const { dealId } = params;
  try {
    return res.render('partials/submit-to-ukef.njk', {
      dealId,
    });
  } catch (error) {
    console.error('GEF UI - error getting submitToUkef page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * Handles the submission of a GEF application to UKEF.
 *
 * @async
 * @function createSubmissionToUkef
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Renders a confirmation, error, or problem view based on the submission outcome.
 */
const createSubmissionToUkef = async (req, res) => {
  const { params, body } = req;
  const { user, userToken } = req.session;
  const { dealId } = params;
  const { confirmSubmitUkef } = body;
  console.info('GEF Application is being submitted to TFM');
  const application = await api.getApplication({ dealId, userToken });
  // Fetch the application with facilities to check if unissuedToIssued
  const applicationWithFacilities = await Application.findById(dealId, user, userToken);

  const { ukefDecisionAccepted } = application;

  try {
    if (!confirmSubmitUkef) {
      const errors = validationErrorHandler({
        errRef: 'confirmSubmitUkef',
        errMsg: 'Select that you have reviewed the information given and want to proceed with the submission',
      });

      return res.render('partials/submit-to-ukef.njk', {
        dealId,
        errors,
      });
    }

    // Always update with the latest checkers details.
    application.checkerId = user._id;
    const hasIssuedFacility = issuedFacilityConfirmation(applicationWithFacilities);
    const submissionType = ukefDecisionAccepted ? CONSTANTS.DEAL_SUBMISSION_TYPE.MIN : application.submissionType;

    await api.updateApplication({ dealId, application, userToken });
    await api.setApplicationStatus({ dealId, status: CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF, userToken });

    // TODO: DTFS2-4706 - add a route and redirect instead of rendering?
    return res.render('partials/submit-to-ukef-confirmation.njk', {
      submissionType,
      status: application.status,
      isNotice: isDealNotice(ukefDecisionAccepted, submissionType),
      ukefDecisionAccepted,
      hasIssuedFacility,
    });
  } catch (error) {
    console.error('Unable to post submit to UKEF %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  submitToUkef,
  createSubmissionToUkef,
};
