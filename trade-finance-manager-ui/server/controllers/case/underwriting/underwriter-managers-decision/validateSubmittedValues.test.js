import validateSubmittedValues from './validateSubmittedValues';
import { generateValidationError } from '../../../../helpers/validation';

describe('POST underwriting - validate submitted values', () => {
  it('should return validationErrors when there is no `decision` value', () => {
    const result = validateSubmittedValues({
      decision: '',
    });

    const expected = generateValidationError(
      'decision',
      'Select if you approve or decline',
      1,
    );

    expect(result).toEqual(expected);
  });

  it('should return validationErrors when `decision` is `Approve with conditions` but no `c`', () => {
    const result = validateSubmittedValues({
      decision: 'Approve with conditions',
      approveWithConditionsComments: '',
    });

    const expected = generateValidationError(
      'approveWithConditionsComments',
      'Enter conditions',
      1,
    );

    expect(result).toEqual(expected);
  });

  it('should return validationErrors when `decision` is `Decline` but no `declineComments`', () => {
    const result = validateSubmittedValues({
      decision: 'Decline',
      declineComments: '',
    });

    const expected = generateValidationError(
      'declineComments',
      'Enter reasons',
      1,
    );

    expect(result).toEqual(expected);
  });

  it('should return false when there are no validationErrors', () => {
    const result = validateSubmittedValues({
      decision: 'Approved without conditions',
    });

    expect(result).toEqual(false);
  });
});
