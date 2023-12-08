/* eslint-disable no-underscore-dangle */
import { TEAM_IDS } from '../../../../constants';
import {
  userCanEditGeneral,
} from './helpers';

describe('case - underwriting - pricing and risk - helpers', () => {
  describe('userCanEditGeneral', () => {
    it('should return true when user is in UNDERWRITER_MANAGERS team', () => {
      const result = userCanEditGeneral(
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: [{ id: TEAM_IDS.UNDERWRITER_MANAGERS }],
        },
      );

      expect(result).toEqual(true);
    });

    it('should return true when user is in UNDERWRITERS team', () => {
      const result = userCanEditGeneral(
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: [{ id: TEAM_IDS.UNDERWRITERS }],
        },
      );

      expect(result).toEqual(true);
    });

    it('should return true when user is in RISK_MANAGERS team', () => {
      const result = userCanEditGeneral(
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: [{ id: TEAM_IDS.RISK_MANAGERS }],
        },
      );

      expect(result).toEqual(true);
    });

    describe('when user is NOT in an allowed team', () => {
      it('should return false', () => {
        const result = userCanEditGeneral(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: [{ id: 'TEST' }],
          },
        );

        expect(result).toEqual(false);
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
