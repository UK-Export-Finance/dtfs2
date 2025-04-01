import { CURRENCY_NUMBER_REGEX } from '@ukef/dtfs2-common';
import { ErrorsOrValue } from '../../../types/errors-or-value';

const MINIMUM_FACILITY_VALUE = 1;
const MAXIMUM_FACILITY_VALUE = 1e12;

const errRef = 'facilityValue';

/**
 * Validates the facility value
 * @param value - the facility value
 * @returns the value or errors depending on the validation result
 */
export const validateFacilityValue = (value: string | number): ErrorsOrValue<number> => {
  const facilityValue: string = value.toString();

  if (!value || !CURRENCY_NUMBER_REGEX.test(facilityValue)) {
    return {
      errors: [{ errRef, errMsg: 'Enter a new facility value' }],
    };
  }

  const valueAsNumber = Number(facilityValue);

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
