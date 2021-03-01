const bondBeneficiaryFacilities = (facilities) =>
  facilities.filter(({ facilitySnapshot }) =>
    facilitySnapshot.ukefFacilityType
    && facilitySnapshot.ukefFacilityType === 'bond'
    && facilitySnapshot.bondBeneficiary);

export default bondBeneficiaryFacilities;
