const { FACILITY_TYPE } = require('@ukef/dtfs2-common');

const mapBankFacilityReference = (facility) => {
  const { ukefFacilityType } = facility;

  if (ukefFacilityType === FACILITY_TYPE.LOAN) {
    return facility.name;
  }

  if (ukefFacilityType === FACILITY_TYPE.BOND) {
    return facility.name;
  }

  return null;
};

module.exports = mapBankFacilityReference;
