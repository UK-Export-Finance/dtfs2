const CONSTANTS = require('../../../constants');

/**
 * Return facility fee record period
 * @param {Object} facility Facility object
 * @param {String} dealType Deal type i.e. GEF, BSS, EWCS
 * @returns {String} Facility fee record period
 */
const getFeeRecordPeriod = (facility, dealType) => {
  // GEF - Single facility fee record creation
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return '01';
  }
  // EWCS/BSS - Multiple facility fee records creation
  return '01';
};

module.exports = getFeeRecordPeriod;
