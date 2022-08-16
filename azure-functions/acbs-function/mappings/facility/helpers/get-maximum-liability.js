/**
 * Returns facility's amount
 * @param {Object} facility Facility object
 * @param {Boolean} overallAmount Facility's overall amount being loaned to exporter by the bank
 * @returns {Float} Facility UKEF exposure amount
 */
const getMaximumLiability = (facility, overallAmount = false) => {
  let facilityValue = 0;

  if (facility.facilitySnapshot) {
    const { value, ukefExposure } = facility.facilitySnapshot;
    // Returns either the whole face value of the facility or UKEF exposure
    facilityValue = overallAmount ? value : ukefExposure;
  } else if (facility.amendment) {
    const { amount } = facility.amendment;

    // Returns UKEF exposure of amended facility amount
    facilityValue = amount;
  }

  const liability = typeof facilityValue === 'string'
    ? facilityValue.replace(/,/g, '')
    : facilityValue;

  return Number(Number(liability).toFixed(2));
};

module.exports = getMaximumLiability;
