import validateSubmittedValues from './validateSubmittedValues';
import { generateValidationErrors } from '../../../../helpers/validation';

describe('POST underwriting - validate submitted values', () => {
  it('should return validationErrors when there is no `decision` value', () => {
    const result = validateSubmittedValues({
      decision: '',
    });

    const expected = generateValidationErrors(
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

      const expected = generateValidationErrors(
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

      const expected = generateValidationErrors(
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

      const expected = generateValidationErrors(
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

      const expected = generateValidationErrors(
        'declineComments',
        'Reasons must be 1000 or fewer',
        1,
      );

      expect(result).toEqual(expected);
    });
  });

  it('should return validationErrors when `internalComments` is over 1000 characters', () => {
    const result = validateSubmittedValues({
      decision: 'Approve without conditions',
      internalComments: 'a'.repeat(1001),
    });

    const expected = generateValidationErrors(
      'internalComments',
      'Comments must be 1000 or fewer',
      1,
    );

    expect(result).toEqual(expected);
  });

  it('should return multiple validation errors', () => {
    const result = validateSubmittedValues({
      decision: '',
      internalComments: 'a'.repeat(1001),
    });

    expect(result.count).toEqual(2);

    const decisionError = generateValidationErrors(
      'decision',
      'Select if you approve or decline',
      1,
    ).errorList.decision;

    expect(result.errorList.decision).toEqual(decisionError);

    const internalCommentsError = generateValidationErrors(
      'internalComments',
      'Comments must be 1000 or fewer',
      2,
    ).errorList.internalComments;

    expect(result.errorList.internalComments).toEqual(internalCommentsError);
  });

  it('should return false when there are no validationErrors', () => {
    const result = validateSubmittedValues({
      decision: 'Approved without conditions',
    });

    expect(result).toEqual(false);
  });
});
