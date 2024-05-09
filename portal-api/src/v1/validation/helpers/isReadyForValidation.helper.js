const { SUBMISSION_TYPE } = require('../../../constants/deal');
const { DEAL_STATUS } = require('../../../constants/facilities');

const isReadyForValidation = (deal, submittedValues) => {
  const { submissionType } = deal;
  const { status } = submittedValues;

  if ((submissionType === SUBMISSION_TYPE.AIN || submissionType === SUBMISSION_TYPE.MIN) && status === DEAL_STATUS.ACKNOWLEDGED) {
    return false;
  }
  return true;
};

module.exports = isReadyForValidation;
