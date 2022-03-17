/**
 * Returns facility UKEF exposure amount, if `loan` then 10% of the UKEF exposure amount.
 * @param {Object} facility Facility object
 * @returns {Float} Facility UKEF exposure amount
 */
const getMaximumLiability = (facility) => {
  const ukefExposure = facility.tfm.ukefExposure || facility.facilitySnapshot.ukefExposure;

  return typeof ukefExposure !== 'number'
    ? Number(ukefExposure.replace(/,/g, ''))
    : ukefExposure;
};
module.exports = getMaximumLiability;
