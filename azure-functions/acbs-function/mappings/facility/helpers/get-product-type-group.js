const CONSTANTS = require('../../../constants');

/**
 * Return facility product type group, commonly used for
 * facility loan record creation.
 * @param {Object} facility Facility object
 * @param {String} dealType Deal type i.e. GEF, BSS, EWCS
 * @returns {String} Facility product type group
 */
const getProductTypeGroup = (facility, dealType) => {
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return CONSTANTS.FACILITY.PRODUCT_TYPE_GROUP.GEF;
  }

  switch (facility.type || facility.facilitySnapshot.type) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return CONSTANTS.FACILITY.PRODUCT_TYPE_GROUP.BSS;

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return CONSTANTS.FACILITY.PRODUCT_TYPE_GROUP.EWCS;

    default:
      return '';
  }
};

module.exports = getProductTypeGroup;
