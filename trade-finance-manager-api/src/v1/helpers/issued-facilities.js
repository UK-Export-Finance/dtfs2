const CONSTANTS = require('../../constants');

const issuedFacilities = (facilities) => {
  const issuedFacilitiesList = facilities.filter((f) => f.hasBeenIssued === true);
  const unissuedFacilitiesList = facilities.filter((f) => f.hasBeenIssued === false);

  return {
    issuedBonds: issuedFacilitiesList.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND),
    unissuedBonds: unissuedFacilitiesList.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND),
    issuedLoans: issuedFacilitiesList.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN),
    unissuedLoans: unissuedFacilitiesList.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN),
  };
};

module.exports = { issuedFacilities };
