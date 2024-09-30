import { isNonEmptyString } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { REGEX } from '../../../constants';

/**
 * Validates the facility ID query parameter.
 * @param originalUrl - The original URL of the request.
 * @param facilityIdQueryName - The name of the facility ID query parameter.
 * @param facilityIdInputSelector - The selector for the facility ID input field.
 * @param facilityIdQuery - The facility ID query parameter value.
 * @returns An error summary view model if validation fails, undefined otherwise.
 */
export const validateFacilityIdQuery = (
  originalUrl: string,
  facilityIdQueryName: string,
  facilityIdInputSelector: string,
  facilityIdQuery?: string,
): ErrorSummaryViewModel | undefined => {
  if (originalUrl.includes(facilityIdQueryName)) {
    if (!isNonEmptyString(facilityIdQuery)) {
      return {
        text: 'Enter a facility ID',
        href: facilityIdInputSelector,
      };
    }
    if (!REGEX.INT.test(facilityIdQuery)) {
      return {
        text: 'Facility ID must be a number',
        href: facilityIdInputSelector,
      };
    }
    if (!REGEX.PARTIAL_FACILITY_ID.test(facilityIdQuery)) {
      return {
        text: 'Facility ID must be between 4 and 10 characters',
        href: facilityIdInputSelector,
      };
    }
  }

  return undefined;
};
