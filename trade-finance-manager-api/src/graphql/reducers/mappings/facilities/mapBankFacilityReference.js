const CONSTANTS = require('../../../../constants');

const mapBankFacilityReference = (facility) => {
  const { ukefFacilityType } = facility;

  if (ukefFacilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
    return facility.bankReferenceNumber;
  }

  if (ukefFacilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    return facility.name;
  }

  return null;
};

module.exports = mapBankFacilityReference;
