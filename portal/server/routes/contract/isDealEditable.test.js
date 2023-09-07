import { ADMIN, CHECKER, MAKER, READ_ONLY } from '../../constants/roles';
import isDealEditable from './isDealEditable';

describe('isDealEditable', () => {
  const nonMakerRoles = [CHECKER, READ_ONLY, ADMIN];

  function makerRoleTests(roleToCombineWithMaker) {
    const roles = roleToCombineWithMaker ? [MAKER, roleToCombineWithMaker] : [MAKER];
    const mockUser = { roles };

    describe("when deal status is NOT `Draft` or `Further Maker's input required`", () => {
      it('should return false', () => {
        const mockAcceptedDeal = {
          status: 'Accepted by UKEF (with conditions)',
          details: {},
        };

        const result = isDealEditable(mockAcceptedDeal, mockUser);
        expect(result).toEqual(false);
      });
    });

    describe('when deal has been submitted', () => {
      it('should return false', () => {
        const mockDeal = {
          status: 'Draft',
          details: {
            submissionDate: 12345678,
          },
        };

        const result = isDealEditable(mockDeal, mockUser);
        expect(result).toEqual(false);
      });
    });

    describe('deal status `Draft`, deal not submitted', () => {
      it('should return true', () => {
        const mockDeal = {
          status: 'Draft',
          details: {},
        };

        const result = isDealEditable(mockDeal, mockUser);
        expect(result).toEqual(true);
      });
    });

    describe("deal status `Further Maker's input required`, deal not submitted", () => {
      it('should return true', () => {
        const mockDeal = {
          status: "Further Maker's input required",
          details: {},
        };

        const result = isDealEditable(mockDeal, mockUser);
        expect(result).toEqual(true);
      });
    });
  }

  function nonMakerRoleTests(nonMakerRole) {
    it('should return false', () => {
      const mockDeal = {
        status: "Further Maker's input required",
        details: {},
      };

      const checkerUser = { roles: [nonMakerRole] };

      const result = isDealEditable(mockDeal, checkerUser);
      expect(result).toEqual(false);
    });
  }

  describe('when user is maker', () => {
    makerRoleTests();
  });

  describe.each(nonMakerRoles)('when user is maker and has additional role (additional role: %S)', (nonMakerRole) => {
    makerRoleTests(nonMakerRole);
  });

  describe.each(nonMakerRoles)('when user is NOT maker (role: %s)', (nonMakerRole) => {
    nonMakerRoleTests(nonMakerRole);
  });
});
