const CONSTANTS = require('../../../constants');

const isIssued = (facility) => {
  const issuedStatuses = [
    CONSTANTS.FACILITY.FACILITIES_STAGE.BOND.ISSUED,
    CONSTANTS.FACILITY.FACILITIES_STAGE.LOAN.UNCONDITIONAL,
  ];
  return issuedStatuses.includes(facility.facilitySnapshot.facilityStage);
};

module.exports = isIssued;
