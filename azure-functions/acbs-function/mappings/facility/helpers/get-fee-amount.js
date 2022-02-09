const CONSTANTS = require('../../../constants');

/**
 * Return facility fee record amount.
 * @param {Object} facility Facility object
 * @param {String} dealType Deal type i.e. GEF, BSS, EWCS
 * @returns {Integer} Fee record amount
 */

const getFeeAmount = (facility, dealType) => {
  // GEF
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return facility.tfm.ukefExposure;
  }

  // EWCS/BSS
  return 0;
};

module.exports = getFeeAmount;
