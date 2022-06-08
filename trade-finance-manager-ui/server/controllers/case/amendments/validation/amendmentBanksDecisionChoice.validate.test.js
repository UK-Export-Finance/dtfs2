import { amendmentBankDecisionChoiceValidation } from './amendmentBanksDecisionChoice.validate';

describe('amendmentBankDecisionChoiceValidation()', () => {
  it('should return an error if no choice is selected', async () => {
    const result = amendmentBankDecisionChoiceValidation(null);

    const expected = {
      errorsObject: {
        errors: {
          errorSummary: [
            {
              text: 'Select if the bank wants to proceed or withdraw',
              href: '#banksDecisionChoiceValue',
            },
          ],
          fieldErrors: {
            banksDecisionChoiceValue: { text: 'Select if the bank wants to proceed or withdraw' },
          },
        },
      },
      amendmentBankDecisionValidationErrors: [
        {
          errRef: 'banksDecisionChoiceValue',
          errMsg: 'Select if the bank wants to proceed or withdraw',
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('should return no errors if choice selected', async () => {
    const result = amendmentBankDecisionChoiceValidation('Proceed');

    const expected = {
      errorsObject: {},
      amendmentBankDecisionValidationErrors: [],
    };

    expect(result).toEqual(expected);
  });
});
