import { MAKER } from '../../constants/roles';
import { MOCK_AIN_APPLICATION_UNISSUED_ONLY, MOCK_MIA_APPLICATION_UNISSUED_ONLY } from '../../utils/mocks/mock-applications';
import { canIssueUnissuedFacilities } from './canIssueUnissuedFacilities';
import { NON_MAKER_ROLES } from '../../../test-helpers/common-role-lists';

describe('canIssueUnissuedFacilities', () => {
  describe('for users without the maker role', () => {
    it.each(NON_MAKER_ROLES)('returns false for users with the %s role (for AIN with unissuedFacilities and no facilitiesChanged to issued)', (role) => {
      const userRoles = [role];
      const application = { ...MOCK_AIN_APPLICATION_UNISSUED_ONLY, userRoles };

      const result = canIssueUnissuedFacilities(application, true, [], null);

      expect(result).toEqual(false);
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
        const result = canIssueUnissuedFacilities(application, true, [], null);
        expect(result).toEqual(true);
      });

      it('returns false if unissuedFacilities and facilitiesChanged to issued', () => {
        const result = canIssueUnissuedFacilities(application, true, ['mock1'], null);
        expect(result).toEqual(false);
      });

      it('returns false if no unissuedFacilities and no facilitiesChanged to issued', () => {
        const result = canIssueUnissuedFacilities(application, false, [], null);
        expect(result).toEqual(false);
      });

      it('returns false if no unissuedFacilities and facilitiesChanged to issued', () => {
        const result = canIssueUnissuedFacilities(application, false, ['mock1'], null);
        expect(result).toEqual(false);
      });
    });

    describe('for MIA', () => {
      const application = {
        ...MOCK_MIA_APPLICATION_UNISSUED_ONLY,
        userRoles,
      };

      it('returns true if unissuedFacilities and no facilitiesChanged to issued and ukefDecisionAccepted is true', () => {
        const result = canIssueUnissuedFacilities(application, true, [], true);
        expect(result).toEqual(true);
      });

      it('returns false if no unissuedFacilities and no facilitiesChanged to issued and ukefDecisionAccepted is true', () => {
        const result = canIssueUnissuedFacilities(application, false, [], true);
        expect(result).toEqual(false);
      });

      it('returns false if unissuedFacilities and facilitiesChanged to issued and ukefDecisionAccepted is true', () => {
        const result = canIssueUnissuedFacilities(application, true, ['mock1'], true);
        expect(result).toEqual(false);
      });

      it('returns false if unissuedFacilities and no facilitiesChanged to issued and ukefDecisionAccepted is false', () => {
        const result = canIssueUnissuedFacilities(application, true, [], false);
        expect(result).toEqual(false);
      });
    });
  });
});
