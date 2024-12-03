import { TEAM_IDS } from '@ukef/dtfs2-common';
import userCanEditManagersDecision from './helpers';

describe('case - underwriter-managers-decision - helpers', () => {
  describe('userCanEditManagersDecision', () => {
    it('should return true', () => {
      const result = userCanEditManagersDecision(
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: [TEAM_IDS.UNDERWRITER_MANAGERS],
        },
        'Manual Inclusion Application',
        {},
      );

      expect(result).toEqual(true);
    });

    describe('when user is NOT in UNDERWRITER_MANAGERS team', () => {
      it('should return false', () => {
        const result = userCanEditManagersDecision(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: [TEAM_IDS.UNDERWRITERS],
          },
          'Manual Inclusion Application',
          {},
        );

        expect(result).toEqual(false);
      });
    });

    describe('when deal is NOT MIA', () => {
      it('should return false', () => {
        const result = userCanEditManagersDecision(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: [TEAM_IDS.UNDERWRITER_MANAGERS],
          },
          'Manual Inclusion Notice',
          {},
        );

        expect(result).toEqual(false);
      });
    });

    describe('when the deal has a managers decision', () => {
      it('should return false', () => {
        const result = userCanEditManagersDecision(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: [TEAM_IDS.UNDERWRITER_MANAGERS],
          },
          'Manual Inclusion Application',
          {
            underwriterManagersDecision: {
              decision: 'Declined',
            },
          },
        );

        expect(result).toEqual(false);
      });
    });
  });
});
