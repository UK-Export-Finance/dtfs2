import { TFM_FACILITY_STAGE } from '@ukef/dtfs2-common';

const CONSTANTS = require('../../../../constants');

const { ISSUED, UNCONDITIONAL, UNISSUED, CONDITIONAL } = CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL;

export const mapGefFacilityStage = (isIssued, tfmFacilityStage) => {
  if (tfmFacilityStage) {
    return tfmFacilityStage;
  }

  return isIssued ? TFM_FACILITY_STAGE.ISSUED : TFM_FACILITY_STAGE.COMMITMENT;
};

export const mapBssEwcsFacilityStage = (facilityStage, tfmFacilityStage) => {
  if (tfmFacilityStage) {
    return tfmFacilityStage;
  }

  if (facilityStage === ISSUED || facilityStage === UNCONDITIONAL) {
    return TFM_FACILITY_STAGE.ISSUED;
  }

  if (facilityStage === UNISSUED || facilityStage === CONDITIONAL) {
    return TFM_FACILITY_STAGE.COMMITMENT;
  }
  return undefined;
};
