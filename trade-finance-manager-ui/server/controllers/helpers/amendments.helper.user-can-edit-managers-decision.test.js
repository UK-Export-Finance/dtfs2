import { userCanEditManagersDecision } from '.';

import MOCKS from '../../test-mocks/amendment-test-mocks';

describe('amendments helper', () => {
  describe('userCanEditManagersDecision()', () => {
    it('should return `true` if the user is in Underwriter Managers team and does not have underwriter managers decision', () => {
      const result = userCanEditManagersDecision(MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, MOCKS.MOCK_USER_UNDERWRITER_MANAGER);
      expect(result).toEqual(true);
    });

    it('should return `false` if the user is in not in Underwriting team', () => {
      const result = userCanEditManagersDecision(MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_USER_UNDERWRITER);
      expect(result).toEqual(false);
    });

    it('should return `false` if the user is in underwriter managers team and amendment has underwriter managers decision', () => {
      const result = userCanEditManagersDecision(MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, MOCKS.MOCK_USER_PIM);
      expect(result).toEqual(false);
    });
  });
});
