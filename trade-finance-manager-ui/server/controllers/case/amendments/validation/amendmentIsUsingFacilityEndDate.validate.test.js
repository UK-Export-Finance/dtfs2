import { isUsingFacilityEndDateValidation } from './amendmentIsUsingFacilityEndDate.validate';

describe('amendmentBankDecisionValidation()', () => {
  it('should return an error if no choice is selected', () => {
    const result = isUsingFacilityEndDateValidation(null);

    const expected = {
      errors: {
        errorSummary: [
          {
            text: 'Select if the bank has provided an end date for this facility',
            href: '#isUsingFacilityEndDate',
          },
        ],
        fieldErrors: {
          isUsingFacilityEndDate: { text: 'Select if the bank has provided an end date for this facility' },
        },
      },
    };

    expect(result).toEqual(expected);
  });

  it('should return no errors if true selected', () => {
    const result = isUsingFacilityEndDateValidation(true);

    const expected = {
      errors: {
        errorSummary: [],
        fieldErrors: {},
      },
    };

    expect(result).toEqual(expected);
  });

  it('should return no errors if false selected', () => {
    const result = isUsingFacilityEndDateValidation(false);

    const expected = {
      errors: {
        errorSummary: [],
        fieldErrors: {},
      },
    };

    expect(result).toEqual(expected);
  });
});
