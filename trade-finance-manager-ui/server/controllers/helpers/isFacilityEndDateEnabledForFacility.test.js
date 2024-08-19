import { isTfmFacilityEndDateFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { isFacilityEndDateEnabledForFacility } from './isFacilityEndDateEnabledForFacility';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('isFacilityEndDateEnabledForTfmFacility', () => {
  const gefFacility = {
    facilitySnapshot: { type: 'Cash facility' },
  };

  const bssEwcsFacility = {
    facilitySnapshot: { type: 'Loan' },
  };

  describe('when TFM Facility end date feature flag disabled', () => {
    it('should return false', () => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);

      const result = isFacilityEndDateEnabledForFacility(gefFacility);

      expect(result).toEqual(false);
    });
  });

  describe('when TFM Facility end date feature flag enabled', () => {
    it('should return true when a GEF facility', () => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);

      const result = isFacilityEndDateEnabledForFacility(gefFacility);

      expect(result).toEqual(true);
    });

    it('should return false when a BSS/EWCS facility', () => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);

      const result = isFacilityEndDateEnabledForFacility(bssEwcsFacility);

      expect(result).toEqual(false);
    });
  });
});
