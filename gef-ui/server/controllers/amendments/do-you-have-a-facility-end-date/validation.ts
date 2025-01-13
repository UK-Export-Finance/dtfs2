import { ErrorsOrValue } from '../../../types/errors-or-value';

export const validateIsUsingFacilityEndDate = (isUsingFacilityEndDate: string | undefined): ErrorsOrValue<boolean> => {
  if (isUsingFacilityEndDate === 'true') {
    return {
      value: true,
    };
  }

  if (isUsingFacilityEndDate === 'false') {
    return {
      value: false,
    };
  }

  return {
    errors: [
      {
        errMsg: 'Select if there is an end date for this facility',
        errRef: 'isUsingFacilityEndDate',
      },
    ],
  };
};
