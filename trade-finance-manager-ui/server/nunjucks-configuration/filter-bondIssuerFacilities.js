const { FACILITY_TYPE } = require('@ukef/dtfs2-common');

const bondIssuerFacilities = (facilities) =>
  facilities.filter(
    ({ facilitySnapshot }) => facilitySnapshot.ukefFacilityType && facilitySnapshot.ukefFacilityType === FACILITY_TYPE.BOND && facilitySnapshot.bondIssuer,
  );

module.exports = bondIssuerFacilities;
