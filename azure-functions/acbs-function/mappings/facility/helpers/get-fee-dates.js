const CONSTANTS = require('../../../constants');

/**
 * Return facility fee record `expirationDate`, `nextDueDate` and `nextAccrueToDate` dates.
 * @param {Object} facility Facility object
 * @param {String} dealType Deal type i.e. GEF, BSS, EWCS
 * @returns {Object} Fee record dates
 */

const getFeeDates = (facility, dealType) => {
  const { guaranteeExpiryDate } = facility.tfm.facilityGuaranteeDates
    ? facility.tfm.facilityGuaranteeDates
    : '';

  // GEF
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return {
      expirationDate: guaranteeExpiryDate,
      nextDueDate: guaranteeExpiryDate,
      nextAccrueToDate: guaranteeExpiryDate,
    };
  }

  // EWCS/BSS
  return {};
};

module.exports = getFeeDates;
