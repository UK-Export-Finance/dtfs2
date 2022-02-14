const CONSTANTS = require('../../../constants');

/**
 * Return facility fee record `expirationDate`, `nextDueDate` and `nextAccrueToDate` dates.
 * @param {Object} facility Facility object
 * @param {String} dealType Deal type i.e. GEF, BSS, EWCS
 * @param {Integer} premiumScheduleIndex Premium schedule index
 * @returns {Object} Fee record dates
 */

const getFeeDates = (facility, dealType, premiumScheduleIndex) => {
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
  if (facility.tfm.premiumSchedule[premiumScheduleIndex]) {
    return {
      expirationDate: facility.tfm.premiumSchedule[premiumScheduleIndex].calculationDate,
      nextDueDate: facility.tfm.premiumSchedule[premiumScheduleIndex].calculationDate,
      nextAccrueToDate: facility.tfm.premiumSchedule[premiumScheduleIndex].calculationDate,
    };
  }

  return {};
};

module.exports = getFeeDates;
