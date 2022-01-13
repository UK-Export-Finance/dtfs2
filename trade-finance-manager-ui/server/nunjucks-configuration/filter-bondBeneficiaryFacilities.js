const CONSTANTS = require('../constants/facility');

const bondBeneficiaryFacilities = (facilities) =>
  facilities.filter(({ facilitySnapshot }) =>
    facilitySnapshot.ukefFacilityType
    && facilitySnapshot.ukefFacilityType === CONSTANTS.FACILITY_TYPE.BOND
    && facilitySnapshot.bondBeneficiary);

module.exports = bondBeneficiaryFacilities;
