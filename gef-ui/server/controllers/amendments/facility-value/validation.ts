import { CURRENCY_NUMBER_REGEX } from '@ukef/dtfs2-common';
import { ValidationError } from '../../../types/validation-error';

const MINIMUM_FACILITY_VALUE = 1;
const MAXIMUM_FACILITY_VALUE = 1e12;

export const validateFacilityValue = (value: string): ValidationError | null => {
  if (!value) {
    return {
      errRef: 'facility-value',
      errMsg: 'Enter the new facility value in number format',
    };
  }

  if (!CURRENCY_NUMBER_REGEX.test(value)) {
    return {
      errRef: 'facility-value',
      errMsg: 'Enter a valid facility value',
    };
  }

  const valueAsNumber = Number(value);

  if (valueAsNumber < MINIMUM_FACILITY_VALUE) {
    return {
      errRef: 'facility-value',
      errMsg: 'Enter a valid facility value',
    };
  }

  if (valueAsNumber > MAXIMUM_FACILITY_VALUE) {
    return {
      errRef: 'facility-value',
      errMsg: 'The new facility value is too high',
    };
  }

  return null;
};
