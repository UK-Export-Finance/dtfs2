import { isNonEmptyString } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { REGEX } from '../../../constants';

const FACILITY_ID_INPUT_ID = `#premium-payments-facility-id-filter`;

export const validateFacilityIdQuery = (originalUrl: string, facilityIdQuery?: string): ErrorSummaryViewModel | undefined => {
  if (originalUrl.includes('?premiumPaymentsFacilityId')) {
    if (!isNonEmptyString(facilityIdQuery)) {
      return {
        text: 'Enter a facility ID',
        href: FACILITY_ID_INPUT_ID,
      };
    }
    if (!REGEX.INT.test(facilityIdQuery)) {
      return {
        text: 'Facility ID must be a number',
        href: FACILITY_ID_INPUT_ID,
      };
    }
    if (!REGEX.PARTIAL_FACILITY_ID.test(facilityIdQuery)) {
      return {
        text: 'Facility ID must be between 4 and 10 characters',
        href: FACILITY_ID_INPUT_ID,
      };
    }
  }

  return undefined;
};
