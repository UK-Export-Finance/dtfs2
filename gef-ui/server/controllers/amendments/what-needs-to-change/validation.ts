import { ValidationError } from '../../../types/validation-error.ts';

const errRef = 'amendmentOptions';

/**
 * @param changeCoverEndDate The reason for cancelling
 * @param changeFacilityValue The reason for cancelling
 * @returns a reason for cancelling errors view model
 */
export const validateWhatNeedsToChange = ({
  changeCoverEndDate,
  changeFacilityValue,
}: {
  changeCoverEndDate: boolean | undefined;
  changeFacilityValue: boolean | undefined;
}): ValidationError | null => {
  if (!changeCoverEndDate && !changeFacilityValue) {
    return {
      errRef,
      errMsg: 'Select if you need to change the facility cover end date, value or both',
    };
  }

  return null;
};
