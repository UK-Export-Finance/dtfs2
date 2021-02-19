const bondIssuerFacilities = (facilities) =>
  facilities.filter((facility) =>
    facility.ukefFacilityType
    && facility.ukefFacilityType === 'bond'
    && facility.bondIssuer);

export default bondIssuerFacilities;
