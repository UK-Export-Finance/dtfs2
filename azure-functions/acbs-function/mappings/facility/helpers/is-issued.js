const CONSTANTS = require('../../../constants');

const isIssued = (facilityStage) => {
  const issuedStatuses = [CONSTANTS.FACILITY.FACILITIES_STAGE.BOND.ISSUED, CONSTANTS.FACILITY.FACILITIES_STAGE.LOAN.UNCONDITIONAL];
  return issuedStatuses.includes(facilityStage);
};

module.exports = isIssued;
