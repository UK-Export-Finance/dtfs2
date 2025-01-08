import { TfmValidationError } from '@ukef/dtfs2-common';
import { ValidationError } from '../types/validation-error';
import { mapValidationError } from './map-validation-error';

describe('mapValidationError', () => {
  it('should map the validation error', () => {
    // Arrange
    const tfmValidationError: TfmValidationError = {
      ref: 'facilityEndDate',
      message: 'Facility end date cannot be before the cover start date',
      fieldRefs: ['facilityEndDate-day', 'facilityEndDate-month', 'facilityEndDate-year'],
    };

    // Act
    const result = mapValidationError(tfmValidationError);

    // Assert
    const expected: ValidationError = {
      errRef: tfmValidationError.ref,
      errMsg: tfmValidationError.message,
      subFieldErrorRefs: tfmValidationError.fieldRefs,
    };

    expect(result).toEqual(expected);
  });
});
