const CONSTANTS = require('../../../../constants');

const mapFacilityStage = (facilityStage) => {
  let mapped;

  if (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED
    || facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL) {
    mapped = CONSTANTS.FACILITIES.FACILITY_STAGE.COMMITMENT;
  } else if (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED
    || facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL) {
    mapped = CONSTANTS.FACILITIES.FACILITY_STAGE.ISSUED;
  }

  return mapped;
};

module.exports = mapFacilityStage;
