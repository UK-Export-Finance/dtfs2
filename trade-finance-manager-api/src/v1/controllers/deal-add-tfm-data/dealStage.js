const CONSTANTS = require('../../../constants');

const dealStage = (status, submissionType) => {
  let tfmDealStage;

  const hasSubmittedStatus = (status === CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.SUBMITTED_TO_UKEF
    || status === CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.SUBMITTED_TO_UKEF);

  if (hasSubmittedStatus) {
    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
      tfmDealStage = CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED;
    }

    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      tfmDealStage = CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION;
    }
  }

  return tfmDealStage;
};

module.exports = dealStage;
