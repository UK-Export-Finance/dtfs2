const CONSTANTS = require('../../constants');

const wasPreviouslyUnissued = (facility) => {
  if (facility.previousFacilityStage) {
    const issuedStatuses = [
      CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED,
      CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL,
    ];

    return issuedStatuses.includes(facility.previousFacilityStage);
  }

  return false;
};

module.exports = wasPreviouslyUnissued;
