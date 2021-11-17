const { STATUS } = require('../../enums');

const supportingInfoStatus = (supportingInfo) => {
  if (supportingInfo) {
    const requiredCount = supportingInfo.requiredFields?.length;

    const supportingInfoAnswers = supportingInfo;
    delete supportingInfoAnswers.requiredFields;
    delete supportingInfoAnswers.status;

    const answeredCount = supportingInfoAnswers.length;
    if (!answeredCount) {
      return STATUS.NOT_STARTED;
    }

    if (answeredCount === requiredCount) {
      return STATUS.COMPLETED;
    }

    return STATUS.IN_PROGRESS;
  }
  return STATUS.NOT_STARTED;
};

module.exports = {
  supportingInfoStatus,
};
