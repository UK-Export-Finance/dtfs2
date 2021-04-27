import helpers from './helpers';

const { isDecisionSubmitted } = helpers;

describe('underwriter-managers-decision helpers', () => {
  describe('isDecisionSubmitted', () => {
    it('should return true when decision is submitted', () => {
      const mockDealTfm = {
        managersDecision: {
          decision: 'Approve with conditions',
          comments: 'Testing',
          internalComments: 'Hello team',
          timestamp: '1604493332767',
        },
      };

      const result = isDecisionSubmitted(mockDealTfm);
      expect(result).toEqual(true);
    });

    it('should return false when decision is NOT submitted', () => {
      const mockDealTfm = {};

      const result = isDecisionSubmitted(mockDealTfm);
      expect(result).toEqual(false);
    });
  });
});
