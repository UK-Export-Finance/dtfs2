const CONSTANTS = require('../../constants');
const api = require('../api');
const { getNowAsEpochMillisecondString } = require('../../utils/date');

const updatePortalDealFromMIAtoMIN = async (dealId, dealType, checker, auditDetails) => {
  console.info('Updating Portal deal from MIA to MIN');
  let dealUpdate;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    dealUpdate = {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      checkerMIN: checker,
      manualInclusionNoticeSubmissionDate: getNowAsEpochMillisecondString(),
    };

    await api.updatePortalGefDeal({ dealId, dealUpdate, auditDetails });

    // adds portal activity object for min submission and facilities changed -> issued
    await api.updateGefMINActivity({ dealId, auditDetails });
  } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    dealUpdate = {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      details: {
        checkerMIN: checker,
        manualInclusionNoticeSubmissionDate: getNowAsEpochMillisecondString(),
      },
    };

    await api.updatePortalDeal(dealId, dealUpdate, auditDetails);
  }

  return dealUpdate;
};

exports.updatePortalDealFromMIAtoMIN = updatePortalDealFromMIAtoMIN;
