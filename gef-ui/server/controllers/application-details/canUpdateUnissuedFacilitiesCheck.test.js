import { MAKER } from '../../constants/roles';
import { MOCK_AIN_APPLICATION_UNISSUED_ONLY, MOCK_MIA_APPLICATION_UNISSUED_ONLY } from '../../utils/mocks/mock-applications';
import { canUpdateUnissuedFacilitiesCheck } from './canUpdateUnissuedFacilitiesCheck';
import { NON_MAKER_ROLES } from '../../../test-helpers/common-role-lists';

describe('canUpdateUnissuedFacilitiesCheck', () => {
  describe('for users without the maker role', () => {
    it.each(NON_MAKER_ROLES)('returns false for users with the %s role (for AIN with unissuedFacilities and no facilitiesChanged to issued)', (role) => {
      const userRoles = [role];
      const application = { ...MOCK_AIN_APPLICATION_UNISSUED_ONLY, userRoles };

      const result = canUpdateUnissuedFacilitiesCheck(application, true, [], null);

      expect(result).toBe(false);
    });
  });

  describe('for users with the maker role', () => {
    const userRoles = [MAKER];

    describe('for AIN', () => {
      const application = {
        ...MOCK_AIN_APPLICATION_UNISSUED_ONLY,
        userRoles,
      };

      it('returns true if unissuedFacilities and no facilitiesChanged to issued', () => {
        const result = canUpdateUnissuedFacilitiesCheck(application, true, [], null);
        expect(result).toBe(true);
      });

      it('returns false if unissuedFacilities and facilitiesChanged to issued', () => {
        const result = canUpdateUnissuedFacilitiesCheck(application, true, ['mock1'], null);
        expect(result).toBe(false);
      });

      it('returns false if no unissuedFacilities and no facilitiesChanged to issued', () => {
        const result = canUpdateUnissuedFacilitiesCheck(application, false, [], null);
        expect(result).toBe(false);
      });

      it('returns false if no unissuedFacilities and facilitiesChanged to issued', () => {
        const result = canUpdateUnissuedFacilitiesCheck(application, false, ['mock1'], null);
        expect(result).toBe(false);
      });
    });

    describe('for MIA', () => {
      const application = {
        ...MOCK_MIA_APPLICATION_UNISSUED_ONLY,
        userRoles,
      };

      it('returns true if unissuedFacilities and no facilitiesChanged to issued and ukefDecisionAccepted is true', () => {
        const result = canUpdateUnissuedFacilitiesCheck(application, true, [], true);
        expect(result).toBe(true);
      });

      it('returns false if no unissuedFacilities and no facilitiesChanged to issued and ukefDecisionAccepted is true', () => {
        const result = canUpdateUnissuedFacilitiesCheck(application, false, [], true);
        expect(result).toBe(false);
      });

      it('returns false if unissuedFacilities and facilitiesChanged to issued and ukefDecisionAccepted is true', () => {
        const result = canUpdateUnissuedFacilitiesCheck(application, true, ['mock1'], true);
        expect(result).toBe(false);
      });

      it('returns false if unissuedFacilities and no facilitiesChanged to issued and ukefDecisionAccepted is false', () => {
        const result = canUpdateUnissuedFacilitiesCheck(application, true, [], false);
        expect(result).toBe(false);
      });
    });
  });
});
