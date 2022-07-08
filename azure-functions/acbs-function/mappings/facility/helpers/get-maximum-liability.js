/**
 * Returns facility's amount
 * @param {Object} facility Facility object
 * @param {Boolean} overallAmount Facility's overall amount being loaned to exporter by the bank
 * @returns {Float} Facility UKEF exposure amount
 */
const getMaximumLiability = (facility, overallAmount = false) => {
  let value = 0;

  if (facility.facilitySnapshot) {
  value = overallAmount
    ? facility.facilitySnapshot.value
    : facility.facilitySnapshot.ukefExposure;
  } else if (facility.amendment) {
    // UKEF Exposure pre-calculated
    value = facility.amendment.amount;
  }

  const amount = typeof value === 'string'
    ? value.replace(/,/g, '')
    : value;

  return Number(Number(amount).toFixed(2));
};

module.exports = getMaximumLiability;
