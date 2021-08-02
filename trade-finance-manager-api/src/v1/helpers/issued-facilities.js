const isIssued = require('./is-issued');
const CONSTANTS = require('../../constants');

const issuedFacilities = (dealSnapshot) => {
  const { facilities } = dealSnapshot;

  const issuedFacilitiesList = facilities.filter((f) => isIssued(f));
  const unissuedFacilitiesList = facilities.filter((f) => !isIssued(f));

  return {
    issuedBonds: issuedFacilitiesList.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND),
    unissuedBonds: unissuedFacilitiesList.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND),
    issuedLoans: issuedFacilitiesList.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN),
    unissuedLoans: unissuedFacilitiesList.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN),
  };
};

module.exports = { issuedFacilities };
