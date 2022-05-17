import { canUserEditBankDecision, canUserEditLeadUnderwriter, canUserEditManagersDecision } from './helpers';

import MOCKS from './test-mocks/amendment-test-mocks';

describe('canUserEditLeadUnderwriter()', () => {
  it('should return true if user is in underwriter managers team', () => {
    const result = canUserEditLeadUnderwriter(MOCKS.MOCK_USER_UNDERWRITER_MANAGER);
    expect(result).toEqual(true);
  });

  it('should return false if user is in PIM team', () => {
    const result = canUserEditLeadUnderwriter(MOCKS.MOCK_USER_PIM);
    expect(result).toEqual(false);
  });

  it('should return false if user is in underwriting team', () => {
    const result = canUserEditLeadUnderwriter(MOCKS.MOCK_USER_UNDERWRITER);
    expect(result).toEqual(false);
  });
});

describe('canUserEditManagersDecision()', () => {
  it('should return true if user is in underwriter managers team and does not have underwriter managers decision', () => {
    const result = canUserEditManagersDecision(MOCKS.MOCK_USER_UNDERWRITER_MANAGER, MOCKS.MOCK_AMENDMENT.amendments);
    expect(result).toEqual(true);
  });

  it('should return false if user is in not in underwriting team', () => {
    const result = canUserEditManagersDecision(MOCKS.MOCK_USER_UNDERWRITER, MOCKS.MOCK_AMENDMENT.amendments);
    expect(result).toEqual(false);
  });

  it('should return false if user is in underwriter managers team and amendment has underwriter managers decision', () => {
    const result = canUserEditManagersDecision(MOCKS.MOCK_USER_PIM, MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments);
    expect(result).toEqual(false);
  });
});

describe('canUserEditBankDecision()', () => {
  it('should return false if user is in PIM team and amendment does not have underwriter managers decision', () => {
    const result = canUserEditBankDecision(MOCKS.MOCK_USER_PIM, MOCKS.MOCK_AMENDMENT.amendments);
    expect(result).toEqual(false);
  });

  it('should return false if user is in not in PIM team', () => {
    const result = canUserEditBankDecision(MOCKS.MOCK_USER_UNDERWRITER_MANAGER, MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments);
    expect(result).toEqual(false);
  });

  it('should return true if user is in PIM team and amendment has an underwriter managers decision', () => {
    MOCKS.MOCK_AMENDMENT.amendments.underwriterManagersDecision = { decision: 'test' };
    const result = canUserEditBankDecision(MOCKS.MOCK_USER_PIM, MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments);
    expect(result).toEqual(true);
  });
});
