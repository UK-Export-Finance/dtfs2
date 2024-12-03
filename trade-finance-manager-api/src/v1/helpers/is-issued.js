const CONSTANTS = require('../../constants');

const isIssued = (facilityStage) => {
  const issuedStatuses = [CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED, CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL];

  return issuedStatuses.includes(facilityStage);
};

module.exports = isIssued;
