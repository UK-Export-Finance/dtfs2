const bondBeneficiaryFacilities = (facilities) =>
  facilities.filter((facility) =>
    facility.ukefFacilityType
    && facility.ukefFacilityType === 'bond'
    && facility.bondBeneficiary);

export default bondBeneficiaryFacilities;
