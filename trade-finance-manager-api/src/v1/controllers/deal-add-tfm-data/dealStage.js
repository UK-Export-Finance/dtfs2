const CONSTANTS = require('../../../constants');

/**
 * Calculates the deal stage based on the given status and submission type.
 *
 * @param {string} status - The status of the deal.
 * @param {string} submissionType - The type of submission.
 * @returns {string} - The calculated deal stage.
 */
const dealStage = (status, submissionType) => {
  const { PORTAL_DEAL_STATUS, SUBMISSION_TYPE, DEAL_STAGE_TFM } = CONSTANTS.DEALS;
  const isSubmissionTypeAinOrMin = [SUBMISSION_TYPE.AIN, SUBMISSION_TYPE.MIN].includes(submissionType);
  const isStatusAcceptable = status === PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED;

  if (isStatusAcceptable && isSubmissionTypeAinOrMin) {
    return DEAL_STAGE_TFM.CONFIRMED;
  }

  console.info('Invalid deal stage with status %s and submission type %s, setting status to Application', status, submissionType);
  return DEAL_STAGE_TFM.APPLICATION;
};

module.exports = dealStage;
