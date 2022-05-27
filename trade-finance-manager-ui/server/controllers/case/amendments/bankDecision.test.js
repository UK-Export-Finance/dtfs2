import api from '../../../api';
import MOCKS from '../../../test-mocks/amendment-test-mocks';
import amendmentBanksDecisionController from '.';

describe('GET getAmendmentBankDecision()', () => {
  it('should return an object with `false` isEditable when `ukefDecision.submitted` is `false` and PIM user', async () => {
    const data = { ...MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, bankDecision: { submitted: false } };
    api.getAmendmentById = () => Promise.resolve({ data, status: 200 });
    api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);

    const result = await amendmentBanksDecisionController.getAmendmentBankDecision(data, MOCKS.MOCK_USER_PIM);

    expect(result).toEqual({
      isEditable: false,
      amendment: {
        ...MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED,
        bankDecision: { submitted: false },
      },
      dealId: MOCKS.MOCK_AMENDMENT.dealId,
      facilityId: MOCKS.MOCK_AMENDMENT.facilityId,
      amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
      underwriterManagersDecision: MOCKS.MOCK_AMENDMENT.underwriterManagersDecision,
      banksDecision: MOCKS.MOCK_AMENDMENT.banksDecision,
    });
  });

  it('should return an object with `true` isEditable when `ukefDecision` is `true` and PIM user', async () => {
    const data = { ...MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED, bankDecision: { submitted: false } };

    const result = await amendmentBanksDecisionController.getAmendmentBankDecision(
      data,
      MOCKS.MOCK_USER_PIM,
    );

    expect(result).toEqual({
      isEditable: true,
      amendment: {
        ...MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED,
        bankDecision: { submitted: false },
      },
      dealId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED.dealId,
      facilityId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED.facilityId,
      amendmentId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED.amendmentId,
      underwriterManagersDecision: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED.underwriterManagersDecision,
      banksDecision: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED.banksDecision,
    });
  });
});
