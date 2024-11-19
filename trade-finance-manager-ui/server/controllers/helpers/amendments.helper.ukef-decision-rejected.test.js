import { ukefDecisionRejected } from '.';

import MOCKS from '../../test-mocks/amendment-test-mocks';

const CONSTANTS = require('../../constants');

describe('amendments helper', () => {
  describe('ukefDecisionRejected()', () => {
    it('should return `true` when facility value and coverEndDate are both declined', () => {
      const result = ukefDecisionRejected(MOCKS.MOCK_AMENDMENT_BOTH_DECLINED);
      expect(result).toEqual(true);
    });

    it('should return `false` when only one of coverEndDate or facility value is declined', () => {
      const result = ukefDecisionRejected(MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED);
      expect(result).toEqual(false);
    });

    it('should return `true` when only facility value is declined', () => {
      const result = ukefDecisionRejected(MOCKS.MOCK_AMENDMENT_FACILITYVALUE);
      expect(result).toEqual(true);
    });

    it('should return `true` when only coverEndDate is declined', () => {
      const result = ukefDecisionRejected(MOCKS.MOCK_AMENDMENT_COVERENDDATE);
      expect(result).toEqual(true);
    });

    it('should return `false` when only facility value is approved', () => {
      MOCKS.MOCK_AMENDMENT_FACILITYVALUE.ukefDecision.value = CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS;
      const result = ukefDecisionRejected(MOCKS.MOCK_AMENDMENT_FACILITYVALUE);
      expect(result).toEqual(false);
    });

    it('should return `true` when only coverEndDate is approved', () => {
      MOCKS.MOCK_AMENDMENT_COVERENDDATE.ukefDecision.coverEndDate = CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS;
      const result = ukefDecisionRejected(MOCKS.MOCK_AMENDMENT_COVERENDDATE);
      expect(result).toEqual(false);
    });
  });
});
