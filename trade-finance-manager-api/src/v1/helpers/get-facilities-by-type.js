const CONSTANTS = require('../../constants');

const getFacilitiesByType = (facilities) => ({
  bonds: facilities.filter(({ type }) =>
    type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND),

  loans: facilities.filter(({ type }) =>
    type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN),

  cashes: facilities.filter(({ type }) =>
    type === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH),

  contingents: facilities.filter(({ type }) =>
    type === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT),
});

module.exports = getFacilitiesByType;
