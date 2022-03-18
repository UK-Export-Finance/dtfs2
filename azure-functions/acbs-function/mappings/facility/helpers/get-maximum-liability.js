/**
 * Returns facility UKEF exposure amount, if `loan` then 10% of the UKEF exposure amount.
 * @param {Object} facility Facility object
 * @returns {Float} Facility UKEF exposure amount
 */
const getMaximumLiability = (facility) => {
  const { ukefExposure } = facility.facilitySnapshot;

  const amount = typeof ukefExposure !== 'number'
    ? Number(ukefExposure.replace(/,/g, ''))
    : ukefExposure;

  return Number(amount.toFixed(2));
};
module.exports = getMaximumLiability;
