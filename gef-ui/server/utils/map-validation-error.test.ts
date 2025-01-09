import { GenericValidationError } from '@ukef/dtfs2-common';
import { ValidationError } from '../types/validation-error';
import { mapValidationError } from './map-validation-error';

describe('mapValidationError', () => {
  it('should map the validation error', () => {
    // Arrange
    const genericValidationError: GenericValidationError = {
      ref: 'facilityEndDate',
      message: 'Facility end date cannot be before the cover start date',
      fieldRefs: ['facilityEndDate-day', 'facilityEndDate-month', 'facilityEndDate-year'],
    };

    // Act
    const result = mapValidationError(genericValidationError);

    // Assert
    const expected: ValidationError = {
      errRef: genericValidationError.ref,
      errMsg: genericValidationError.message,
      subFieldErrorRefs: genericValidationError.fieldRefs,
    };

    expect(result).toEqual(expected);
  });
});
