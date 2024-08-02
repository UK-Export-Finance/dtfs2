const { FACILITY_TYPE } = require('@ukef/dtfs2-common');

const getFacilitiesByType = (facilities) => ({
  bonds: facilities.filter(({ type }) => type === FACILITY_TYPE.BOND),

  loans: facilities.filter(({ type }) => type === FACILITY_TYPE.LOAN),

  cashes: facilities.filter(({ type }) => type === FACILITY_TYPE.CASH),

  contingents: facilities.filter(({ type }) => type === FACILITY_TYPE.CONTINGENT),
});

module.exports = getFacilitiesByType;
