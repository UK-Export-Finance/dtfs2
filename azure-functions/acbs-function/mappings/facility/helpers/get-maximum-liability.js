const getMaximumLiability = (facilitySnapshot) => {
  if (typeof facilitySnapshot.ukefExposure !== 'number') {
    return Number(facilitySnapshot.ukefExposure.replace(/,/g, ''));
  }
  return facilitySnapshot.ukefExposure;
};
module.exports = getMaximumLiability;
