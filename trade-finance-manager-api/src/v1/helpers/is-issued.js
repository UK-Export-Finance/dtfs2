const CONSTANTS = require('../../constants');

const isIssued = (facility) => {
  const issuedStatuses = [
    CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED,
    CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL,
  ];
  return issuedStatuses.includes(facility.facilityStage);
};

module.exports = isIssued;
