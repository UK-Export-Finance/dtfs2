/**
 * Returns facility's amount
 * @param {Object} facility Facility object
 * @param {Boolean} overallAmount Facility's overall amount being loaned to exporter by the bank
 * @returns {Float} Facility UKEF exposure amount
 */
const getMaximumLiability = (facility, overallAmount = false) => {
  const value = overallAmount
    ? facility.facilitySnapshot.value
    : facility.facilitySnapshot.ukefExposure;

  const amount = typeof value !== 'number'
    ? value.replace(/,/g, '')
    : value;

  return Number(Number(amount).toFixed(2));
};
module.exports = getMaximumLiability;
