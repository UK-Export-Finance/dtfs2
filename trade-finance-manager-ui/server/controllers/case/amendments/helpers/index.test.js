import { userCanEditBankDecision, userCanEditLeadUnderwriter, userCanEditManagersDecision } from '.';

import MOCKS from '../../../../test-mocks/amendment-test-mocks';

describe('userCanEditLeadUnderwriter()', () => {
  it('should return `true` if user is in underwriter managers team', () => {
    const result = userCanEditLeadUnderwriter(MOCKS.MOCK_USER_UNDERWRITER_MANAGER);
    expect(result).toEqual(true);
  });

  it('should return `false` if user is in PIM team', () => {
    const result = userCanEditLeadUnderwriter(MOCKS.MOCK_USER_PIM);
    expect(result).toEqual(false);
  });

  it('should return `true` if user is in underwriting team', () => {
    const result = userCanEditLeadUnderwriter(MOCKS.MOCK_USER_UNDERWRITER);
    expect(result).toEqual(true);
  });
});

describe('userCanEditManagersDecision()', () => {
  it('should return true if user is in underwriter managers team and does not have underwriter managers decision', () => {
    const result = userCanEditManagersDecision(MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, MOCKS.MOCK_USER_UNDERWRITER_MANAGER);
    expect(result).toEqual(true);
  });

  it('should return false if user is in not in underwriting team', () => {
    const result = userCanEditManagersDecision(MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_USER_UNDERWRITER);
    expect(result).toEqual(false);
  });

  it('should return false if user is in underwriter managers team and amendment has underwriter managers decision', () => {
    const result = userCanEditManagersDecision(MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, MOCKS.MOCK_USER_PIM);
    expect(result).toEqual(false);
  });
});

describe('userCanEditBankDecision()', () => {
  it('should return false if user is in PIM team and amendment does not have underwriter managers decision', () => {
    const result = userCanEditBankDecision(MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_USER_PIM);
    expect(result).toEqual(false);
  });

  it('should return false if user is in not in PIM team', () => {
    const result = userCanEditBankDecision(MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, MOCKS.MOCK_USER_UNDERWRITER_MANAGER);
    expect(result).toEqual(false);
  });

  it('should return true if user is in PIM team and bank\'s has been NOT submitted', () => {
    const amendment = {
      ...MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED,
      bankDecision: { submitted: false },
    };

    const result = userCanEditBankDecision(amendment, MOCKS.MOCK_USER_PIM);
    expect(result).toEqual(true);
  });
});
