const CONSTANTS = require('../constants/facility');

const bondIssuerFacilities = (facilities) =>
  facilities.filter(({ facilitySnapshot }) =>
    facilitySnapshot.ukefFacilityType
    && facilitySnapshot.ukefFacilityType === CONSTANTS.FACILITY_TYPE.BOND
    && facilitySnapshot.bondIssuer);

module.exports = bondIssuerFacilities;
