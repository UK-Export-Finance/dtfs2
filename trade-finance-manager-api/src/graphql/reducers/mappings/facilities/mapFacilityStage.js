const CONSTANTS = require('../../../../constants');

const mapFacilityStage = (facilityStage) => {
  let mapped;

  // NOTE: we have two data sources.
  // - Bond & Loan facilities have facilityStage string of 'issued' or 'unissued'.
  // - Cash & Contingent facilities have hasBeenIssued boolean.
  // TODO: add hasBeenIssued boolean to Bond & Loan facilities.

  const isIssuedGefFacility = (facilityStage === true);

  if (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED
    || facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL
    || isIssuedGefFacility) {
    mapped = CONSTANTS.FACILITIES.FACILITY_STAGE.ISSUED;
  } else if (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED
    || facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL
    || !isIssuedGefFacility) {
    mapped = CONSTANTS.FACILITIES.FACILITY_STAGE.COMMITMENT;
  }

  return mapped;
};

module.exports = mapFacilityStage;
