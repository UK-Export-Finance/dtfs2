import { amendmentBankDecisionValidation } from './amendmentBanksDecisionChoice.validate';

describe('amendmentBankDecisionValidation()', () => {
  it('should return an error if no choice is selected', async () => {
    const result = amendmentBankDecisionValidation(null);

    const expected = {
      errorsObject: {
        errors: {
          errorSummary: [
            {
              text: 'Select if the bank wants to proceed or withdraw',
              href: '#banksDecision',
            },
          ],
          fieldErrors: {
            banksDecision: { text: 'Select if the bank wants to proceed or withdraw' },
          },
        },
      },
      amendmentBankDecisionValidationErrors: [
        {
          errRef: 'banksDecision',
          errMsg: 'Select if the bank wants to proceed or withdraw',
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('should return no errors if choice selected', async () => {
    const result = amendmentBankDecisionValidation('Proceed');

    const expected = {
      errorsObject: {},
      amendmentBankDecisionValidationErrors: [],
    };

    expect(result).toEqual(expected);
  });
});
