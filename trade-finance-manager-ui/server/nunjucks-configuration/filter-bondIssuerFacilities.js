const bondIssuerFacilities = (facilities) =>
  facilities.filter(({ facilitySnapshot }) =>
    facilitySnapshot.ukefFacilityType
    && facilitySnapshot.ukefFacilityType === 'bond'
    && facilitySnapshot.bondIssuer);

module.exports = bondIssuerFacilities;
