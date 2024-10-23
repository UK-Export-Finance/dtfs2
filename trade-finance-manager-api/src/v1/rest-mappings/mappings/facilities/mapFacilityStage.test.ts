import { TFM_FACILITY_STAGE } from '@ukef/dtfs2-common';
import { mapBssEwcsFacilityStage, mapGefFacilityStage } from './mapFacilityStage';
import CONSTANTS from '../../../../constants';

const { ISSUED, UNCONDITIONAL, UNISSUED, CONDITIONAL } = CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL;

describe('mapGefFacilityStage', () => {
  describe('when a tfm facility stage is passed in', () => {
    it('should return the tfm facility stage', () => {
      const result = mapGefFacilityStage(true, TFM_FACILITY_STAGE.RISK_EXPIRED);
      expect(result).toEqual(TFM_FACILITY_STAGE.RISK_EXPIRED);
    });
  });

  describe('when facilityStage is true boolean', () => {
    it('should return facilityStage as `Issued`', () => {
      const result = mapGefFacilityStage(true);
      expect(result).toEqual(TFM_FACILITY_STAGE.ISSUED);
    });
  });

  describe('when facilityStage is false boolean', () => {
    it('should return facilityStage as `Commitment`', () => {
      const result = mapGefFacilityStage(false);
      expect(result).toEqual(TFM_FACILITY_STAGE.COMMITMENT);
    });
  });
});

describe('mapBssEwcsFacilityStage', () => {
  describe('when a tfm facility stage is passed in', () => {
    it('should return the tfm facility stage', () => {
      const result = mapBssEwcsFacilityStage(ISSUED, TFM_FACILITY_STAGE.RISK_EXPIRED);
      expect(result).toEqual(TFM_FACILITY_STAGE.RISK_EXPIRED);
    });
  });

  describe('when facilityStage is `Issued`', () => {
    it('should return facilityStage as `Issued`', () => {
      const result = mapBssEwcsFacilityStage(ISSUED);
      expect(result).toEqual(TFM_FACILITY_STAGE.ISSUED);
    });
  });

  describe('when facilityStage is `Unconditional`', () => {
    it('should return facilityStage as `Issued`', () => {
      const result = mapBssEwcsFacilityStage(UNCONDITIONAL);
      expect(result).toEqual(TFM_FACILITY_STAGE.ISSUED);
    });
  });

  describe('when facilityStage is `Unissued`', () => {
    it('should return facilityStage as `Commitment`', () => {
      const result = mapBssEwcsFacilityStage(UNISSUED);
      expect(result).toEqual(TFM_FACILITY_STAGE.COMMITMENT);
    });
  });

  describe('when facilityStage is `Conditional`', () => {
    it('should return facilityStage as `Commitment`', () => {
      const result = mapBssEwcsFacilityStage(CONDITIONAL);
      expect(result).toEqual(TFM_FACILITY_STAGE.COMMITMENT);
    });
  });
});
