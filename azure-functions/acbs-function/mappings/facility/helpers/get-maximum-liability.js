const getMaximumLiability = (facilitySnapshot) => {
  return typeof facilitySnapshot.ukefExposure !== 'number' ? Number(facilitySnapshot.ukefExposure.replace(/,/g, '')) : facilitySnapshot.ukefExposure;
};
module.exports = getMaximumLiability;
