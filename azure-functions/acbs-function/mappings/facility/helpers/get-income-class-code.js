const CONSTANTS = require('../../../constants');

/**
 * Return facility income class code as per
 * facility type. Same is used for reconciliation with CODA.
 * @param {String} facility Facility object
 * @returns {String} Facility income class code or `null` upon a failure.
 */
const getIncomeClassCode = (facility) => {
  if (facility.facilitySnapshot) {
    const { type } = facility.facilitySnapshot;

    switch (type) {
      // GEF
      case CONSTANTS.FACILITY.FACILITY_TYPE.CASH:
        return CONSTANTS.FACILITY.ACBS_INCOME_CLASS_CODE.GEF;
      // GEF
      case CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT:
        return CONSTANTS.FACILITY.ACBS_INCOME_CLASS_CODE.GEF;
      // EWCS
      case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
        return CONSTANTS.FACILITY.ACBS_INCOME_CLASS_CODE.EWCS;
      // BSS
      case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
        return CONSTANTS.FACILITY.ACBS_INCOME_CLASS_CODE.BSS;
      default:
        return null;
    }
  }
  return null;
};

module.exports = getIncomeClassCode;
