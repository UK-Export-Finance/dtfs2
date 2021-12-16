const CONSTANTS = require('../../../../constants');

const supportingInfoStatus = (supportingInfo) => {
  if (supportingInfo) {
    const requiredCount = supportingInfo.requiredFields?.length;

    const supportingInfoAnswers = supportingInfo;
    delete supportingInfoAnswers.requiredFields;
    delete supportingInfoAnswers.status;

    const answeredCount = Object.keys(supportingInfoAnswers).length;

    if (!answeredCount) {
      return CONSTANTS.DEAL.GEF_STATUS.NOT_STARTED;
    }

    if (answeredCount === requiredCount) {
      return CONSTANTS.DEAL.GEF_STATUS.COMPLETED;
    }

    return CONSTANTS.DEAL.GEF_STATUS.IN_PROGRESS;
  }
  return CONSTANTS.DEAL.GEF_STATUS.NOT_STARTED;
};

module.exports = {
  supportingInfoStatus,
};
