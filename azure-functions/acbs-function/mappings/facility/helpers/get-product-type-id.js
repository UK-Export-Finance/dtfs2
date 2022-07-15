const CONSTANTS = require('../../../constants');

/**
 * Return facility product ACBS compliant code.
 * @param {Object} facility Facility object
 * @param {Boolean} facilityMasterRecord Set to `true` if creating facility master record
 * @returns {String} Facility product ACBS compliant code, GEF facility master record will return `280`.
 */
const getProductTypeId = (facility, facilityMasterRecord = false) => {
  switch (facility.type || facility.facilitySnapshot.type) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return CONSTANTS.FACILITY.FACILITY_TYPE_CODE.BSS;

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return CONSTANTS.FACILITY.FACILITY_TYPE_CODE.EWCS;

    case CONSTANTS.FACILITY.FACILITY_TYPE.CASH:
      return CONSTANTS.FACILITY.FACILITY_TYPE_CODE.CASH;

    case CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT:
      return facilityMasterRecord
        ? CONSTANTS.FACILITY.FACILITY_TYPE_CODE.CASH
        : CONSTANTS.FACILITY.FACILITY_TYPE_CODE.CONTINGENT;

    default:
      return CONSTANTS.FACILITY.FACILITY_TYPE_CODE.CASH;
  }
};

module.exports = getProductTypeId;
