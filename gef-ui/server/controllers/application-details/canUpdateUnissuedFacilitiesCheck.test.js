import {
  MOCK_AIN_APPLICATION_UNISSUED_ONLY,
  MOCK_MIA_APPLICATION_UNISSUED_ONLY,
} from '../../utils/mocks/mock_applications';
import { canUpdateUnissuedFacilitiesCheck } from './canUpdateUnissuedFacilitiesCheck';

describe('canUpdateUnissuedFacilitiesCheck', () => {
  describe('for AIN', () => {
    const application = MOCK_AIN_APPLICATION_UNISSUED_ONLY;

    it('returns true if unissuedFacilities and no facilitiesChanged to issued', () => {
      const result = canUpdateUnissuedFacilitiesCheck(application, true, [], null);
      expect(result).toEqual(true);
    });

    it('returns false if unissuedFacilities and facilitiesChanged to issued', () => {
      const result = canUpdateUnissuedFacilitiesCheck(application, true, ['mock1'], null);
      expect(result).toEqual(false);
    });

    it('returns false if no unissuedFacilities and no facilitiesChanged to issued', () => {
      const result = canUpdateUnissuedFacilitiesCheck(application, false, [], null);
      expect(result).toEqual(false);
    });

    it('returns false if no unissuedFacilities and facilitiesChanged to issued', () => {
      const result = canUpdateUnissuedFacilitiesCheck(application, false, ['mock1'], null);
      expect(result).toEqual(false);
    });
  });

  describe('for MIA', () => {
    const application = MOCK_MIA_APPLICATION_UNISSUED_ONLY;

    it('returns true if unissuedFacilities and no facilitiesChanged to issued and ukefDecisionAccepted is true', () => {
      const result = canUpdateUnissuedFacilitiesCheck(application, true, [], true);
      expect(result).toEqual(true);
    });

    it('returns false if no unissuedFacilities and no facilitiesChanged to issued and ukefDecisionAccepted is true', () => {
      const result = canUpdateUnissuedFacilitiesCheck(application, false, [], true);
      expect(result).toEqual(false);
    });

    it('returns false if unissuedFacilities and facilitiesChanged to issued and ukefDecisionAccepted is true', () => {
      const result = canUpdateUnissuedFacilitiesCheck(application, true, ['mock1'], true);
      expect(result).toEqual(false);
    });

    it('returns false if unissuedFacilities and no facilitiesChanged to issued and ukefDecisionAccepted is false', () => {
      const result = canUpdateUnissuedFacilitiesCheck(application, true, [], false);
      expect(result).toEqual(false);
    });
  });
});
