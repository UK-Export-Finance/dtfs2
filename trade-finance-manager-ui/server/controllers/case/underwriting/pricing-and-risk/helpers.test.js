/* eslint-disable no-underscore-dangle */
import { userCanEditGeneral } from './helpers';

describe('case - underwriting - pricing and risk - helpers', () => {
  describe('userCanEditGeneral', () => {
    it('should return true when user is in UNDERWRITER_MANAGERS team', () => {
      const result = userCanEditGeneral({
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: ['UNDERWRITER_MANAGERS'],
      });

      expect(result).toEqual(true);
    });

    it('should return true when user is in UNDERWRITERS team', () => {
      const result = userCanEditGeneral({
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: ['UNDERWRITERS'],
      });

      expect(result).toEqual(true);
    });

    it('should return true when user is in RISK_MANAGERS team', () => {
      const result = userCanEditGeneral({
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: ['RISK_MANAGERS'],
      });

      expect(result).toEqual(true);
    });

    describe('when user is NOT in an allowed team', () => {
      it('should return false', () => {
        const result = userCanEditGeneral({
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: ['TEST'],
        });

        expect(result).toEqual(false);
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
