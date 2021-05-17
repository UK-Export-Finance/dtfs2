/* eslint-disable no-underscore-dangle */
import canUserEditManagersDecision from './helpers';

describe('case - underwriter-managers-decision - helpers', () => {
  describe('canUserEditManagersDecision', () => {
    it('should return true', () => {
      const result = canUserEditManagersDecision(
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: ['UNDERWRITER_MANAGERS'],
        },
        'Manual Inclusion Application',
        {},
      );

      expect(result).toEqual(true);
    });

    describe('when user is NOT in UNDERWRITER_MANAGERS team', () => {
      it('should return false', () => {
        const result = canUserEditManagersDecision(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: ['UNDERWRITERS'],
          },
          'Manual Inclusion Application',
          {},
        );

        expect(result).toEqual(false);
      });
    });

    describe('when deal is NOT MIA', () => {
      it('should return false', () => {
        const result = canUserEditManagersDecision(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: ['UNDERWRITER_MANAGERS'],
          },
          'Manual Inclusion Notice',
          {},
        );

        expect(result).toEqual(false);
      });
    });

    describe('when the deal has a managers decision', () => {
      it('should return false', () => {
        const result = canUserEditManagersDecision(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: ['UNDERWRITER_MANAGERS'],
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

/* eslint-enable no-underscore-dangle */
