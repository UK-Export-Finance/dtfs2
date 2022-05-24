/**
 * Date helper functions
 */
const CONSTANTS = require('../constant');

/**
 * Evaluates deal tfm status / stage.
 * @param {Object} deal Deal object
 * @returns {String} TFM deal status if `Submitted` otherwise an empty string.
 */
const getDealTfmStage = (deal) => {
  if (deal.status === CONSTANTS.DEAL.PORTAL_STATUS.SUBMITTED_TO_UKEF) {
    if (deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      return CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED;
    }

    if (deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
      return CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION;
    }

    if (deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      return CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED;
    }
  }

  return '';
};

module.exports = {
  getDealTfmStage,
};
