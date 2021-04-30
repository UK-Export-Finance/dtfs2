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

  describe('when `decision` is `Approve with conditions`', () => {
    it('should return validationErrors when there is no `approveWithConditionsComments`', () => {
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

    it('should return validationErrors when `approveWithConditionsComments` is over 1000 characters', () => {
      const result = validateSubmittedValues({
        decision: 'Approve with conditions',
        approveWithConditionsComments: 'a'.repeat(1001),
      });

      const expected = generateValidationError(
        'approveWithConditionsComments',
        'Conditions must be 1000 or fewer',
        1,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('when `decision` is `Decline`', () => {
    it('should return validationErrors when there is no `declineComments`', () => {
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

    it('should return validationErrors when `declineComments` is over 1000 characters', () => {
      const result = validateSubmittedValues({
        decision: 'Decline',
        declineComments: 'a'.repeat(1001),
      });

      const expected = generateValidationError(
        'declineComments',
        'Reasons must be 1000 or fewer',
        1,
      );

      expect(result).toEqual(expected);
    });
  });

  it('should return false when there are no validationErrors', () => {
    const result = validateSubmittedValues({
      decision: 'Approved without conditions',
    });

    expect(result).toEqual(false);
  });
});
