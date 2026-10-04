const CONSTANTS = require('../../../constants');

const { EXPORTER_CREDIT_RATING, CREDIT_RATING } = CONSTANTS.DEAL;

/**
 * Returns ACBS credit rating code based on deal's exporter credit rating.
 * `AIN` = B+(14)
 * `MIN` = TFM value if BB- or B+, otherwise Not known (98)
 * Handles both the old and new style of stored credit rating values
 * @param {object} deal Deal object
 * @returns {string} ACBS credit rating code`
 */
const getCreditRatingCode = (deal) => {
  // `AIN` = B+(14)
  if (deal.dealSnapshot.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
    return CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS;
  }

  // `MIN` = TFM value
  if (deal.tfm) {
    switch (deal.tfm.exporterCreditRating) {
      // BB- (13) for Good (BB-) or BB-
      case EXPORTER_CREDIT_RATING.BB_MINUS:
      case CREDIT_RATING.BB_MINUS:
        return CONSTANTS.FACILITY.CREDIT_RATING.BB_MINUS;

      // B+ (14) for Acceptable (B+) or B+
      case EXPORTER_CREDIT_RATING.B_PLUS:
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
