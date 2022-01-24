const CONSTANTS = require('../../constants');

const issuedFacilities = (facilities) => {
  const issuedFacilitiesList = facilities.filter((f) => f.hasBeenIssued === true);
  const unissuedFacilitiesList = facilities.filter((f) => f.hasBeenIssued === false);

  return {
    // BSS & EWCS facilities
    issuedBonds: issuedFacilitiesList.filter((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND),
    unissuedBonds: unissuedFacilitiesList.filter((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND),
    issuedLoans: issuedFacilitiesList.filter((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN),
    unissuedLoans: unissuedFacilitiesList.filter((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN),
    // GEF (Cash & Contingent) facilities
    issuedCash: issuedFacilitiesList.filter((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH),
    unissuedCash: unissuedFacilitiesList.filter((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH),
    issuedContingent: issuedFacilitiesList.filter((f) =>
      f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT),
    unissuedContingent: unissuedFacilitiesList.filter((f) =>
      f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT),
  };
};

module.exports = { issuedFacilities };
