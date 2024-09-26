import { isNonEmptyString } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { REGEX } from '../../../constants';

export const validateFacilityIdQuery = (
  facilityIdQuery: string | undefined,
  originalUrl: string,
  facilityIdInputId: string,
): ErrorSummaryViewModel | undefined => {
  if (originalUrl.includes('?premiumPaymentsFacilityId')) {
    if (!isNonEmptyString(facilityIdQuery)) {
      return {
        text: 'Enter a facility ID',
        href: facilityIdInputId,
      };
    }
    if (!REGEX.INT.test(facilityIdQuery)) {
      return {
        text: 'Facility ID must be a number',
        href: facilityIdInputId,
      };
    }
    if (!REGEX.PARTIAL_FACILITY_ID.test(facilityIdQuery)) {
      return {
        text: 'Facility ID must be between 4 and 10 characters',
        href: facilityIdInputId,
      };
    }
  }

  return undefined;
};
