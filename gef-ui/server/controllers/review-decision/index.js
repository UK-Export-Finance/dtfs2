const { validationErrorHandler } = require('../../utils/helpers');
const { applicationDetails } = require('../application-details');
const api = require('../../services/api');

const acceptUkefDecision = async (req, res) => {
  const { applicationId } = req.params;
  const { decision } = req.body;

  try {
    if (decision) {
      const application = await api.getApplication(applicationId);

      application.ukefDecisionAccepted = true;
      await api.updateApplication(applicationId, application);
      return res.redirect(`/gef/application-details/${applicationId}/confirm-cover-start-date`);
    }
    const errors = validationErrorHandler({
      errRef: 'decision',
      errMsg: 'Select yes if you want to accept the conditions and proceed with UKEF cover.',
    });
    req.errors = errors;
    return applicationDetails(req, res);
  } catch (error) {
    console.error('Error accepting UKEF decision', { error });
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  acceptUkefDecision,
};
