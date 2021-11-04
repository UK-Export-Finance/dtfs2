const CONSTANTS = require('../../constants');

const getFacilitiesByType = (facilities) => ({
  bonds: facilities.filter(({ facilityType }) =>
    facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND),

  loans: facilities.filter(({ facilityType }) =>
    facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN),

  cashes: facilities.filter(({ facilityType }) =>
    facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH),

  contingents: facilities.filter(({ facilityType }) =>
    facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT),
});

module.exports = getFacilitiesByType;
