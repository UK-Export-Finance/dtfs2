import { PremiumPaymentsFilters } from '@ukef/dtfs2-common';
import { REGEX } from '../../../../../constants';

/**
 * Parses the provided premium payments tab filters to test validity.
 * @param premiumPaymentsFilters - The unparsed filters to be applied for the premium payments table
 * @param premiumPaymentsFilters.facilityId - The facility ID filter
 * @returns The parsed filters for the premium payments tab
 */
export const parsePremiumPaymentsFilters = (premiumPaymentsFilters?: PremiumPaymentsFilters): PremiumPaymentsFilters => {
  if (!premiumPaymentsFilters || !premiumPaymentsFilters.facilityId) {
    return {};
  }

  const { facilityId } = premiumPaymentsFilters;

  let facilityIdFilter;

  if (REGEX.UKEF_PARTIAL_FACILITY_ID_REGEX.test(facilityId)) {
    facilityIdFilter = facilityId;
  }

  return {
    facilityId: facilityIdFilter,
  };
};
