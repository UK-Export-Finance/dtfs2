const CONSTANTS = require('../../../constants');

/**
 * Return facility income class code
 * @param {String} dealType Deal type i.e. GEF, BSS, EWCS
 * @returns {String} Facility income class code
 */
const getIncomeClassCode = (dealType) => {
  switch (dealType) {
    case CONSTANTS.PRODUCT.TYPE.BSS:
      return CONSTANTS.FACILITY.ACBS_INCOME_CLASS_CODE.BSS;
    case CONSTANTS.PRODUCT.TYPE.EWCS:
      return CONSTANTS.FACILITY.ACBS_INCOME_CLASS_CODE.EWCS;
    case CONSTANTS.PRODUCT.TYPE.GEF:
      return CONSTANTS.FACILITY.ACBS_INCOME_CLASS_CODE.GEF;
    default:
      return CONSTANTS.FACILITY.ACBS_INCOME_CLASS_CODE.BSS;
  }
};

module.exports = getIncomeClassCode;
