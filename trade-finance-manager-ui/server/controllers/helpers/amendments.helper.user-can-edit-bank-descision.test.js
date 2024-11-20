import { userCanEditBankDecision } from '.';

import MOCKS from '../../test-mocks/amendment-test-mocks';

describe('amendments helper', () => {
  describe('userCanEditBankDecision()', () => {
    it('should return `false` if the  user is in PIM team and amendment does not have underwriter managers decision', () => {
      const result = userCanEditBankDecision(MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_USER_PIM);
      expect(result).toEqual(false);
    });

    it('should return `false` if the user is in not in PIM team', () => {
      const result = userCanEditBankDecision(MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, MOCKS.MOCK_USER_UNDERWRITER_MANAGER);
      expect(result).toEqual(false);
    });

    it("should return `true` if the user is in PIM team and bank's decision has been NOT submitted", () => {
      const amendment = {
        ...MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED,
        bankDecision: { submitted: false },
      };

      const result = userCanEditBankDecision(amendment, MOCKS.MOCK_USER_PIM);
      expect(result).toEqual(true);
    });
  });
});
