const CONSTANTS = require('../../../constants');

/**
 * Returns ACBS credit rating code based on deal's exporter credit rating.
 * `AIN` = B+(14)
 * `MIN` = TFM value
 * @param {Object} deal Deal object
 * @returns {String} ACBS credit rating code, defaults to `B+(14)`
 */
const getCreditRatingCode = (deal) => {
  // `AIN` = B+(14)
  if (deal.dealSnapshot.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
    return CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS;
  }

  // `MIN` = TFM value
  if (deal.tfm) {
    switch (deal.tfm.exporterCreditRating) {
      // BB- (13)
      case CONSTANTS.DEAL.EXPORTER_CREDIT_RATING.BB_MINUS:
        return CONSTANTS.FACILITY.CREDIT_RATING.BB_MINUS;

      // B+ (14)
      case CONSTANTS.DEAL.EXPORTER_CREDIT_RATING.B_PLUS:
        return CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS;

      // Not know (98)
      default:
        return CONSTANTS.FACILITY.CREDIT_RATING.NOT_KNOWN;
    }
  }

  return CONSTANTS.FACILITY.CREDIT_RATING.NOT_KNOWN;
};

module.exports = getCreditRatingCode;
