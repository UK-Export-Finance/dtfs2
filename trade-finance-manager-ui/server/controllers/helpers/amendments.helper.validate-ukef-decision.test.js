import { validateUkefDecision } from '.';

import MOCKS from '../../test-mocks/amendment-test-mocks';

const CONSTANTS = require('../../constants');

describe('amendments helper', () => {
  describe('validateUkefDecision()', () => {
    it('should return `true` when facility value and coverEndDate are both declined', () => {
      const result = validateUkefDecision(MOCKS.MOCK_AMENDMENT_BOTH_DECLINED.ukefDecision, CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED);
      expect(result).toEqual(true);
    });

    it('should return `true` when only one of coverEndDate or facility value is declined', () => {
      const result = validateUkefDecision(
        MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.ukefDecision,
        CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED,
      );
      expect(result).toEqual(true);
    });

    it('should return `false` when only none of coverEndDate or facility value is declined', () => {
      MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.ukefDecision.value = CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS;
      const result = validateUkefDecision(
        MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.ukefDecision,
        CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED,
      );
      expect(result).toEqual(false);
    });

    it('should return `true` when only facility value is declined', () => {
      MOCKS.MOCK_AMENDMENT_FACILITYVALUE.ukefDecision.value = CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED;
      const result = validateUkefDecision(MOCKS.MOCK_AMENDMENT_FACILITYVALUE.ukefDecision, CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED);
      expect(result).toEqual(true);
    });

    it('should return `true` when only coverEndDate is declined', () => {
      MOCKS.MOCK_AMENDMENT_COVERENDDATE.ukefDecision.value = CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED;
      const result = validateUkefDecision(MOCKS.MOCK_AMENDMENT_COVERENDDATE.ukefDecision, CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED);
      expect(result).toEqual(true);
    });

    it('should return `false` when only facility value is approved', () => {
      MOCKS.MOCK_AMENDMENT_FACILITYVALUE.ukefDecision.value = CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS;
      const result = validateUkefDecision(MOCKS.MOCK_AMENDMENT_FACILITYVALUE.ukefDecision, CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED);
      expect(result).toEqual(false);
    });
  });
});
