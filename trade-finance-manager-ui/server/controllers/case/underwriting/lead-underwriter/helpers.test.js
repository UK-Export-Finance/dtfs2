/* eslint-disable no-underscore-dangle */
import canUserEditLeadUnderwriter from './helpers';

describe('case - lead-underwriter - helpers', () => {
  describe('canUserEditLeadUnderwriter', () => {
    it('should return true', () => {
      const result = canUserEditLeadUnderwriter(
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: ['UNDERWRITER_MANAGERS'],
        },
      );

      expect(result).toEqual(true);
    });

    describe('when user is NOT in UNDERWRITER_MANAGERS team', () => {
      it('should return false', () => {
        const result = canUserEditLeadUnderwriter(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: ['UNDERWRITERS'],
          },
        );

        expect(result).toEqual(false);
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
