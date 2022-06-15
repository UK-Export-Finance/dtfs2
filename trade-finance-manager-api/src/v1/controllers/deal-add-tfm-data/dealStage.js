const CONSTANTS = require('../../../constants');

const dealStage = (status, submissionType) => {
  let tfmDealStage;

  const hasSubmittedStatus = (status === CONSTANTS.DEALS.PORTAL_DEAL_STATUS.SUBMITTED_TO_UKEF
    || status === CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED);

  if (hasSubmittedStatus) {
    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
      tfmDealStage = CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED;
    }

    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      tfmDealStage = CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION;
    }

    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN) {
      tfmDealStage = CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED;
    }
  }

  if (status === CONSTANTS.DEALS.PORTAL_DEAL_STATUS.ABANDONED) {
    return CONSTANTS.DEALS.DEAL_STAGE_TFM.ABANDONED;
  }

  return tfmDealStage;
};

module.exports = dealStage;
