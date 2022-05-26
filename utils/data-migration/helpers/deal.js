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
  if (deal.status === CONSTANTS.DEAL.PORTAL_STATUS.SUBMITTED_TO_UKEF
    || deal.status === CONSTANTS.DEAL.PORTAL_STATUS.UKEF_ACKNOWLEDGED) {
    if (deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      return CONSTANTS.DEAL.TFM_STATUS.CONFIRMED;
    }

    if (deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
      return CONSTANTS.DEAL.TFM_STATUS.APPLICATION;
    }

    if (deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      return CONSTANTS.DEAL.TFM_STATUS.CONFIRMED;
    }
  }

  if (deal.status === CONSTANTS.DEAL.PORTAL_STATUS.ABANDONED) {
    return CONSTANTS.DEAL.TFM_STATUS.ABANDONED;
  }

  return '';
};

module.exports = {
  getDealTfmStage,
};
