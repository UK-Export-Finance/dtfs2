const CONSTANTS = require('../../constants');
const api = require('../api');
const now = require('../../now');

const updatePortalDealFromMIAtoMIN = async (dealId, dealType, checker) => {
  console.info('Updating Portal deal from MIA to MIN');
  let dealUpdate;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    dealUpdate = {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      checkerMIN: checker,
      manualInclusionNoticeSubmissionDate: now(),
    };

    await api.updatePortalGefDeal(dealId, dealUpdate);

    // adds portal activity object for min submission and facilities changed -> issued
    await api.updateGefMINActivity(dealId);
  } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    dealUpdate = {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      details: {
        checkerMIN: checker,
        manualInclusionNoticeSubmissionDate: now(),
      },
    };

    await api.updatePortalDeal(dealId, dealUpdate);
  }

  return dealUpdate;
};

exports.updatePortalDealFromMIAtoMIN = updatePortalDealFromMIAtoMIN;
