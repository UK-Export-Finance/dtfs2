const CONSTANTS = require('../../constants');
const api = require('../api');
const now = require('../../now');

const updatePortalDealFromMIAtoMIN = async (dealId, checker) => {
  console.log('Updating Portal deal from MIA to MIN');

  const dealUpdate = {
    details: {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      checkerMIN: checker,
      manualInclusionNoticeSubmissionDate: now(),
    },
  };

  const update = await api.updatePortalDeal(
    dealId,
    dealUpdate,
  );

  return update;
};

exports.updatePortalDealFromMIAtoMIN = updatePortalDealFromMIAtoMIN;
