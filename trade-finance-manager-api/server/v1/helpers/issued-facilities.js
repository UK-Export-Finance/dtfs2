const { FACILITY_TYPE } = require('@ukef/dtfs2-common');

const issuedFacilities = (facilities) => {
  const issuedFacilitiesList = facilities.filter((f) => f.hasBeenIssued === true);
  const unissuedFacilitiesList = facilities.filter((f) => f.hasBeenIssued === false);

  return {
    // BSS & EWCS facilities
    issuedBonds: issuedFacilitiesList.filter((f) => f.type === FACILITY_TYPE.BOND),
    unissuedBonds: unissuedFacilitiesList.filter((f) => f.type === FACILITY_TYPE.BOND),
    issuedLoans: issuedFacilitiesList.filter((f) => f.type === FACILITY_TYPE.LOAN),
    unissuedLoans: unissuedFacilitiesList.filter((f) => f.type === FACILITY_TYPE.LOAN),
    // GEF (Cash & Contingent) facilities
    issuedCash: issuedFacilitiesList.filter((f) => f.type === FACILITY_TYPE.CASH),
    unissuedCash: unissuedFacilitiesList.filter((f) => f.type === FACILITY_TYPE.CASH),
    issuedContingent: issuedFacilitiesList.filter((f) => f.type === FACILITY_TYPE.CONTINGENT),
    unissuedContingent: unissuedFacilitiesList.filter((f) => f.type === FACILITY_TYPE.CONTINGENT),
  };
};

module.exports = { issuedFacilities };
