import { CURRENCY_NUMBER_REGEX } from '@ukef/dtfs2-common';
import { ValidationError } from '../../../types/validation-error';

const MINIMUM_FACILITY_VALUE = 1;
const MAXIMUM_FACILITY_VALUE = 1e12;

const errRef = 'facilityValue';

/**
 * Validates the facility value
 * @param value - the facility value
 * @returns the value or errors depending on the validation result
 */
export const validateFacilityValue = (value: string): { errors: ValidationError[] } | { value: number } => {
  if (!value) {
    return {
      errors: [
        {
          errRef,
          errMsg: 'Enter the new facility value in number format',
        },
      ],
    };
  }

  if (!CURRENCY_NUMBER_REGEX.test(value)) {
    return {
      errors: [{ errRef, errMsg: 'Enter a valid facility value' }],
    };
  }

  const valueAsNumber = Number(value);

  if (valueAsNumber < MINIMUM_FACILITY_VALUE) {
    return {
      errors: [{ errRef, errMsg: 'Enter a valid facility value' }],
    };
  }

  if (valueAsNumber > MAXIMUM_FACILITY_VALUE) {
    return {
      errors: [{ errRef, errMsg: 'The new facility value is too high' }],
    };
  }

  return { value: valueAsNumber };
};
