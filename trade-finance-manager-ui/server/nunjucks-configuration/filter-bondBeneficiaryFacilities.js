const { FACILITY_TYPE } = require('@ukef/dtfs2-common');

const bondBeneficiaryFacilities = (facilities) =>
  facilities.filter(
    ({ facilitySnapshot }) => facilitySnapshot.ukefFacilityType && facilitySnapshot.ukefFacilityType === FACILITY_TYPE.BOND && facilitySnapshot.bondBeneficiary,
  );

module.exports = bondBeneficiaryFacilities;
