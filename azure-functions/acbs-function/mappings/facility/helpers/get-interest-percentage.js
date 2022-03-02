/**
 * Return facility interest percentage for BSS/EWCS deals
 * and `null` for GEF.
 * @param {Object} facility Facility object
 * @returns {Integer} Facility interest percentage
 */
const getInterestPercentage = (facility) => Number(facility.facilitySnapshot.interestPercentage)
|| Number(facility.facilitySnapshot.riskMarginFee);

module.exports = getInterestPercentage;
