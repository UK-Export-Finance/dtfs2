const CONSTANTS = require('../../constants');
const api = require('../api');
const now = require('../../now');

const updatePortalDealFromMIAtoMIN = async (dealId, dealType, checker) => {
  console.log('Updating Portal deal from MIA to MIN');
  let update;
  let dealUpdate;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    dealUpdate = {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      checkerMIN: checker,
      manualInclusionNoticeSubmissionDate: now(),
    };

    update = await api.updatePortalGefDeal(
      dealId,
      dealUpdate,
    );
    console.log('======>', dealId);
    // adds portal activity object for min submission and facilities changed -> issued
    update = await api.updateGefMINActivity(dealId);
    console.log('--------------------------------------------');
  } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    dealUpdate = {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      details: {
        checkerMIN: checker,
        manualInclusionNoticeSubmissionDate: now(),
      },
    };

    update = await api.updatePortalDeal(
      dealId,
      dealUpdate,
    );
  }

  return update;
};

exports.updatePortalDealFromMIAtoMIN = updatePortalDealFromMIAtoMIN;
