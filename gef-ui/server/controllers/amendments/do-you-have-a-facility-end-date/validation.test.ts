import { validateIsUsingFacilityEndDate } from './validation';

describe('validateIsUsingFacilityEndDate', () => {
  it('returns value true if the input is "true"', () => {
    const input = 'true';

    const result = validateIsUsingFacilityEndDate(input);

    expect(result).toEqual({ value: true });
  });

  it('returns value false if the input is "false"', () => {
    const input = 'false';

    const result = validateIsUsingFacilityEndDate(input);

    expect(result).toEqual({ value: false });
  });

  it('returns validation errors if the input is ""', () => {
    const input = '';

    const result = validateIsUsingFacilityEndDate(input);

    expect(result).toEqual({
      errors: [
        {
          errMsg: 'Select if there is an end date for this facility',
          errRef: 'isUsingFacilityEndDate',
        },
      ],
    });
  });

  it('returns validation errors if the input is undefined', () => {
    const input = undefined;

    const result = validateIsUsingFacilityEndDate(input);

    expect(result).toEqual({
      errors: [
        {
          errMsg: 'Select if there is an end date for this facility',
          errRef: 'isUsingFacilityEndDate',
        },
      ],
    });
  });
});
