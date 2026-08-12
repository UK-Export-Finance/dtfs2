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
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', deal.tfm.exporterCreditRating);

  // `MIN` = TFM value
  if (deal.tfm) {
    switch (deal.tfm.exporterCreditRating) {
      // BB- (13) for Good (BB-) or BB-
      case EXPORTER_CREDIT_RATING.BB_MINUS:
        console.log('test switch BB-');
        break;
      case CREDIT_RATING.BB_MINUS:
        console.log('test switch BB- 2');
        break;

      // B+ (14) for Acceptable (B+) or B+
      case EXPORTER_CREDIT_RATING.B_PLUS:
        console.log('test switch B+');
        break;
      case CREDIT_RATING.B_PLUS:
        console.log('test switch B+ 2');
        break;

      // Not know (98)
      default:
        console.log('test switch default');
        break;
    }

    console.log('switch 2');

    switch (deal.tfm.exporterCreditRating) {
      // BB- (13) for Good (BB-) or BB-
      case EXPORTER_CREDIT_RATING.BB_MINUS:
      case CREDIT_RATING.BB_MINUS:
        console.log('test switch2 BB-');
        break;

      // B+ (14) for Acceptable (B+) or B+
      case EXPORTER_CREDIT_RATING.B_PLUS:
      case CREDIT_RATING.B_PLUS:
        console.log('test switch 22222 B+');
        break;

      // Not know (98)
      default:
        console.log('test switch  2 default');
        break;
    }

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
