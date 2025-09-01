import { ROLES } from '@ukef/dtfs2-common';
import isDealEditable from './isDealEditable';

const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');

const { MAKER } = ROLES;

describe('isDealEditable', () => {
  describe('when user is maker', () => {
    const roles = [MAKER];
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
  });

  describe.each(NON_MAKER_ROLES)('when user is NOT maker (role %s)', (nonMakerRole) => {
    const user = { roles: [nonMakerRole] };

    it('should return false', () => {
      const mockDeal = {
        status: "Further Maker's input required",
        details: {},
      };

      const result = isDealEditable(mockDeal, user);
      expect(result).toEqual(false);
    });
  });
});
