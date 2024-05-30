import { TEAM_IDS } from '@ukef/dtfs2-common';
import { userCanEditGeneral } from './helpers';

describe('case - underwriting - pricing and risk - helpers', () => {
  describe('userCanEditGeneral', () => {
    it('should return true when user is in UNDERWRITER_MANAGERS team', () => {
      const result = userCanEditGeneral({
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: [TEAM_IDS.UNDERWRITER_MANAGERS],
      });

      expect(result).toEqual(true);
    });

    it('should return true when user is in UNDERWRITERS team', () => {
      const result = userCanEditGeneral({
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: [TEAM_IDS.UNDERWRITERS],
      });

      expect(result).toEqual(true);
    });

    it('should return true when user is in RISK_MANAGERS team', () => {
      const result = userCanEditGeneral({
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: [TEAM_IDS.RISK_MANAGERS],
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
