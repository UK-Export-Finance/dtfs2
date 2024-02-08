const { validationErrorHandler } = require('../../utils/helpers');
const { getIssuedFacilitiesAsArray } = require('../../utils/facility-helpers');
const { applicationDetails } = require('../application-details');
const api = require('../../services/api');

const acceptUkefDecision = async (req, res) => {
  const { dealId } = req.params;
  const { decision } = req.body;
  const { user, userToken } = req.session;
  const { _id: editorId } = user;

  try {
    if (decision) {
      const application = await api.getApplication({ dealId, userToken });
      const facilities = await api.getFacilities({ dealId, userToken });

      application.ukefDecisionAccepted = true;
      application.editorId = editorId;
      await api.updateApplication({ dealId, application, userToken });
      /**
       * If issued facilities available then redirect user to
       * set cover start date else issue a facility
       * * */
      const link = getIssuedFacilitiesAsArray(facilities).length
        ? `/gef/application-details/${dealId}/cover-start-date`
        : `/gef/application-details/${dealId}/unissued-facilities`;

      return res.redirect(link);
    }
    const errors = validationErrorHandler({
      errRef: 'decision',
      errMsg: 'Select yes if you want to accept the conditions and proceed with UKEF cover.',
    });
    req.errors = errors;
    return applicationDetails(req, res);
  } catch (error) {
    console.error('Error accepting UKEF decision %O', error);
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  acceptUkefDecision,
};
