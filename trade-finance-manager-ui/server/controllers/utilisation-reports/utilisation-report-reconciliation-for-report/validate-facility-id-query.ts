import { isNonEmptyString } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { REGEX } from '../../../constants';

export const validateFacilityIdQuery = (facilityIdQuery: string | undefined, originalUrl: string): ErrorSummaryViewModel | undefined => {
  if (
    originalUrl.includes('?') &&
    originalUrl.includes('facilityIdQuery') &&
    (!isNonEmptyString(facilityIdQuery) || !REGEX.PARTIAL_FACILITY_ID.test(facilityIdQuery))
  ) {
    return {
      text: 'Enter 4-10 characters of a facility ID',
      href: '#facility-id-filter',
    };
  }

  return undefined;
};
