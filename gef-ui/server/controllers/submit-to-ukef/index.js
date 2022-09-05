const CONSTANTS = require('../../constants');
const { validationErrorHandler } = require('../../utils/helpers');
const { isDealNotice } = require('../../utils/deal-helpers');
const { issuedFacilityConfirmation } = require('../../utils/facility-helpers');
const api = require('../../services/api');
const Application = require('../../models/application');

const submitToUkef = (req, res) => {
  const { params } = req;
  const { dealId } = params;
  try {
    return res.render('partials/submit-to-ukef.njk', {
      dealId,
    });
  } catch (err) {
    console.error(err);
    return res.render('partials/problem-with-service.njk');
  }
};

const createSubmissionToUkef = async (req, res) => {
  const { params, body } = req;
  const { user, userToken } = req.session;
  const { dealId } = params;
  const { confirmSubmitUkef } = body;
  console.info('GEF Application is being submitted to UKEF--TFM');
  const application = await api.getApplication(dealId);
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

    await api.updateApplication(dealId, application);
    await api.setApplicationStatus(dealId, CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF);

    // TODO: DTFS2-4706 - add a route and redirect instead of rendering?
    return res.render('partials/submit-to-ukef-confirmation.njk', {
      submissionType,
      status: application.status,
      isNotice: isDealNotice(ukefDecisionAccepted, submissionType),
      ukefDecisionAccepted,
      hasIssuedFacility,
    });
  } catch (err) {
    console.error('Unable to post submit to UKEF', { err });
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  submitToUkef,
  createSubmissionToUkef,
};
