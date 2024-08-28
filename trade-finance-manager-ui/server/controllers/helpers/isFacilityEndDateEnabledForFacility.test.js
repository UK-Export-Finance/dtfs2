import { isTfmFacilityEndDateFeatureFlagEnabled, MAPPED_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { isFacilityEndDateEnabledForFacility } from './isFacilityEndDateEnabledForFacility';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('isFacilityEndDateEnabledForTfmFacility', () => {
  const gefCashFacility = {
    facilitySnapshot: { type: MAPPED_FACILITY_TYPE.CASH },
  };

  const gefContingentFacility = {
    facilitySnapshot: { type: MAPPED_FACILITY_TYPE.CONTINGENT },
  };

  const bssEwcsFacility = {
    facilitySnapshot: { type: MAPPED_FACILITY_TYPE.LOAN },
  };

  describe('when TFM Facility end date feature flag is disabled', () => {
    it('should return false', () => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);

      const result = isFacilityEndDateEnabledForFacility(gefCashFacility);

      expect(result).toEqual(false);
    });
  });

  describe('when TFM Facility end date feature flag is enabled', () => {
    it.each`
      testFacility
      ${gefCashFacility}
      ${gefContingentFacility}
    `(`should return true when provided a GEF facility with '$testFacility.facilitySnapshot.type' type`, ({ testFacility }) => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);

      const result = isFacilityEndDateEnabledForFacility(testFacility);

      expect(result).toEqual(true);
    });

    it('should return false when a BSS/EWCS facility', () => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);

      const result = isFacilityEndDateEnabledForFacility(bssEwcsFacility);

      expect(result).toEqual(false);
    });
  });
});
