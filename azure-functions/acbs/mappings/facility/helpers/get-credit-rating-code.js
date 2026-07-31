const CONSTANTS = require('../../../constants');

const { EXPORTER_CREDIT_RATING, CREDIT_RATING } = CONSTANTS.DEAL;

/**
 * Returns ACBS credit rating code based on deal's exporter credit rating.
 * `AIN` = B+(14)
 * `MIN` = TFM value
 * Handles both the old and new style of credit rating values
 * @param {object} deal Deal object
 * @returns {string} ACBS credit rating code, defaults to `B+(14)`
 */
const getCreditRatingCode = (deal) => {
  // `AIN` = B+(14)
  if (deal.dealSnapshot.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
    return CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS;
  }

  // `MIN` = TFM value
  if (deal.tfm) {
    switch (deal.tfm.exporterCreditRating) {
      // BB- (13) for Good (BB-)
      case EXPORTER_CREDIT_RATING.BB_MINUS:
        return CONSTANTS.FACILITY.CREDIT_RATING.BB_MINUS;

      // BB- (13) for BB-
      case CREDIT_RATING.BB_MINUS:
        return CONSTANTS.FACILITY.CREDIT_RATING.BB_MINUS;

      // B+ (14) for Acceptable (B+)
      case EXPORTER_CREDIT_RATING.B_PLUS:
        return CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS;

      // B+ (14) for B+
      case CREDIT_RATING.B_PLUS:
        return CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS;

      // Not know (98)
      default:
        return CONSTANTS.FACILITY.CREDIT_RATING.NOT_KNOWN;
    }
  }

  return CONSTANTS.FACILITY.CREDIT_RATING.NOT_KNOWN;
};

module.exports = getCreditRatingCode;
