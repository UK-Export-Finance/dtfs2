const CONSTANTS = require('../../../constants');

/**
 * Calculates the deal stage based on the status and submission type.
 *
 * The dealStage function takes two parameters, status and submissionType, and returns a value based on their values.
 * If the status is not equal to PORTAL_DEAL_STATUS.SUBMITTED_TO_UKEF, it returns DEAL_STAGE_TFM.APPLICATION. Otherwise,
 * if the submissionType is either SUBMISSION_TYPE.AIN or SUBMISSION_TYPE.MIN, it returns DEAL_STAGE_TFM.CONFIRMED.
 * Otherwise, it returns DEAL_STAGE_TFM.APPLICATION.
 *
 * @param {string} status - The status of the deal.
 * @param {string} submissionType - The type of submission.
 * @returns {string} - The calculated deal stage.
 */
const dealStage = (status, submissionType) => {
  const { PORTAL_DEAL_STATUS, SUBMISSION_TYPE, DEAL_STAGE_TFM } = CONSTANTS.DEALS;

  if (status !== PORTAL_DEAL_STATUS.SUBMITTED_TO_UKEF) {
    return DEAL_STAGE_TFM.APPLICATION;
  }

  return submissionType === SUBMISSION_TYPE.AIN || submissionType === SUBMISSION_TYPE.MIN ? DEAL_STAGE_TFM.CONFIRMED : DEAL_STAGE_TFM.APPLICATION;
};

module.exports = dealStage;
