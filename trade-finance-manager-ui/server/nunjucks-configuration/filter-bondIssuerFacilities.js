const bondIssuerFacilities = (facilities) =>
  facilities.filter(({ facilitySnapshot }) =>
    facilitySnapshot.ukefFacilityType
    && facilitySnapshot.ukefFacilityType === 'bond'
    && facilitySnapshot.bondIssuer);

export default bondIssuerFacilities;
