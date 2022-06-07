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
  if (deal.status === CONSTANTS.DEAL.PORTAL_STATUS.SUBMITTED_TO_UKEF || deal.status === CONSTANTS.DEAL.PORTAL_STATUS.UKEF_ACKNOWLEDGED) {
    return deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN || deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
      ? CONSTANTS.DEAL.TFM_STATUS.CONFIRMED
      : CONSTANTS.DEAL.TFM_STATUS.APPLICATION;
  }

  if (deal.status === CONSTANTS.DEAL.PORTAL_STATUS.ABANDONED) {
    return CONSTANTS.DEAL.TFM_STATUS.ABANDONED;
  }

  return '';
};

/**
 * Evaluated deal's product code on the basis of deal type or facilities type
 * @param {Object} deal Deal object
 * @returns {String} Deal product code, if no matching condition then `null`.
 */
const getDealProduct = (deal) => {
  const { dealType } = deal;

  if (dealType === CONSTANTS.DEAL.DEAL_TYPE.GEF) {
    return CONSTANTS.DEAL.DEAL_TYPE.GEF;
  }

  if (dealType === CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS) {
    const { facilities } = deal;

    const bonds = facilities.filter((f) => f.type === CONSTANTS.FACILITY.FACILITY_TYPE.BOND);
    const loans = facilities.filter((f) => f.type === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN);

    const hasBonds = bonds.length > 0;
    const hasLoans = loans.length > 0;

    if (hasBonds && hasLoans) {
      return `${CONSTANTS.FACILITY.FACILITY_PRODUCT_CODE.BOND} & ${CONSTANTS.FACILITY.FACILITY_PRODUCT_CODE.LOAN}`;
    }

    if (hasBonds) {
      return CONSTANTS.FACILITY.FACILITY_PRODUCT_CODE.BOND;
    }

    if (hasLoans) {
      return CONSTANTS.FACILITY.FACILITY_PRODUCT_CODE.LOAN;
    }
  }

  return null;
};

/**
 * Returns deal's PoD based on deal type.
 * @param {Object} deal Deal object
 * @returns {Integer}
 */
const getProbabilityOfDefault = (deal) => (deal.dealType === CONSTANTS.DEAL.DEAL_TYPE.GEF
  ? Number(deal.exporter.probabilityOfDefault)
  : CONSTANTS.DEAL.PROBABILITY_OF_DEFAULT.DEFAULT_VALUE);

/**
 * Returns deal's exporter credit rating
 * @param {Deal} deal Deal object
 * @returns {String}
 */
const getexporterCreditRating = (deal) => (deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
  ? CONSTANTS.DEAL.CREDIT_RATING.ACCEPTABLE
  : '');

module.exports = {
  getDealTfmStage,
  getDealProduct,
  getProbabilityOfDefault,
  getexporterCreditRating,
};
