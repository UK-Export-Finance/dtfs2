import { TFM_FACILITY_STAGE, TfmFacilityStage, ValuesOf } from '@ukef/dtfs2-common';

import CONSTANTS from '../../../../constants';

const { ISSUED, UNCONDITIONAL, UNISSUED, CONDITIONAL } = CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL;
type PortalFacilityStageType = ValuesOf<typeof CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL>;

/**
 * Gets the mapped facility stage for a GEF Facility
 * @param isIssued boolean isIssued parameter
 * @param tfmFacilityStage optional passed in Tfm facility stage
 * @returns the mapped facility stage
 */
export const mapGefFacilityStage = (isIssued: boolean, tfmFacilityStage?: TfmFacilityStage): TfmFacilityStage => {
  if (tfmFacilityStage) {
    return tfmFacilityStage;
  }

  return isIssued ? TFM_FACILITY_STAGE.ISSUED : TFM_FACILITY_STAGE.COMMITMENT;
};

/**
 * Gets the mapped facility stage for a BSS/EWCS Facility
 * @param facilityStage the passed in portal facility stage from the facility snapshot in the DB
 * @param tfmFacilityStage optional passed in Tfm facility stage
 * @returns the mapped facility stage
 */
export const mapBssEwcsFacilityStage = (facilityStage: PortalFacilityStageType, tfmFacilityStage?: TfmFacilityStage): TfmFacilityStage | null => {
  if (tfmFacilityStage) {
    return tfmFacilityStage;
  }

  if (facilityStage === ISSUED || facilityStage === UNCONDITIONAL) {
    return TFM_FACILITY_STAGE.ISSUED;
  }

  if (facilityStage === UNISSUED || facilityStage === CONDITIONAL) {
    return TFM_FACILITY_STAGE.COMMITMENT;
  }

  return null;
};
