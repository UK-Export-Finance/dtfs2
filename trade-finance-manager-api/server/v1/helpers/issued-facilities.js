const { FACILITY_TYPE } = require('@ukef/dtfs2-common');

const issuedFacilities = (facilities) => {
  const issuedFacilitiesList = facilities.filter((facility) => facility.hasBeenIssued === true);
  const unissuedFacilitiesList = facilities.filter((facility) => facility.hasBeenIssued === false);

  return {
    // BSS & EWCS facilities
    issuedBonds: issuedFacilitiesList.filter((facility) => facility.type === FACILITY_TYPE.BOND),
    unissuedBonds: unissuedFacilitiesList.filter((facility) => facility.type === FACILITY_TYPE.BOND),
    issuedLoans: issuedFacilitiesList.filter((facility) => facility.type === FACILITY_TYPE.LOAN),
    unissuedLoans: unissuedFacilitiesList.filter((facility) => facility.type === FACILITY_TYPE.LOAN),
    // GEF (Cash & Contingent) facilities
    issuedCash: issuedFacilitiesList.filter((facility) => facility.type === FACILITY_TYPE.CASH),
    unissuedCash: unissuedFacilitiesList.filter((facility) => facility.type === FACILITY_TYPE.CASH),
    issuedContingent: issuedFacilitiesList.filter((facility) => facility.type === FACILITY_TYPE.CONTINGENT),
    unissuedContingent: unissuedFacilitiesList.filter((facility) => facility.type === FACILITY_TYPE.CONTINGENT),
  };
};

module.exports = { issuedFacilities };
