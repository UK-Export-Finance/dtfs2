const CONSTANTS = require('../../constants');
const api = require('../api');

const updatePortalDealFromMIAtoMIN = async (dealId, portalChecker) => {
  const dealUpdate = {
    details: {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      checkerMIN: portalChecker,
      // manualInclusionNoticeSubmissionDate
    },
  };

  const update = await api.updatePortalDeal(
    dealId,
    dealUpdate,
  );

  return update;
};

exports.updatePortalDealFromMIAtoMIN = updatePortalDealFromMIAtoMIN;
