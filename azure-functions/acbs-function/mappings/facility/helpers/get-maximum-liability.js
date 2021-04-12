const getMaximumLiability = ({ facilitySnapshot }) => Number(facilitySnapshot.ukefExposure.replace(/,/g, ''));
module.exports = getMaximumLiability;
