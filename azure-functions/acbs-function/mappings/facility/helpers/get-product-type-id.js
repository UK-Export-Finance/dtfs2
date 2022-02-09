const CONSTANTS = require('../../../constants');

/**
 * Return facility product type ID
 * @param {Object} facility Facility object
 * @param {String} dealType Deal type i.e. GEF, BSS, EWCS
 * @returns {String} Facility product type ID
 */
const getProductTypeId = (facility, dealType) => {
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return CONSTANTS.FACILITY.FACILITY_TYPE_CODE.GEF;
  }

  switch (facility.facilitySnapshot.type) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return CONSTANTS.FACILITY.FACILITY_TYPE_CODE.BSS;

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return CONSTANTS.FACILITY.FACILITY_TYPE_CODE.EWCS;

    default:
      return '';
  }
};

module.exports = getProductTypeId;
