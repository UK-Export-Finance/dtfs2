const { to2Decimals } = require('../../../helpers/currency');

/**
 * Returns facility's amount
 * @param {object} facility Facility object
 * @param {boolean} overallAmount Facility's overall amount being loaned to exporter by the bank
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

  return to2Decimals(facilityValue);
};

module.exports = getMaximumLiability;
