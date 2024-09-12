import { UtilisationReportPremiumPaymentsTabFilters } from '@ukef/dtfs2-common';
import { REGEX } from '../../../../../constants';

/**
 * Parses the provided premium payments tab filters to test validity.
 * @param premiumPaymentsTabFilters - The unparsed filters to be applied for the premium payments table
 * @param premiumPaymentsTabFilters.facilityId - The facility ID filter
 * @returns The parsed filters for the premium payments tab
 */
export const parsePremiumPaymentsTabFilters = (
  premiumPaymentsTabFilters?: UtilisationReportPremiumPaymentsTabFilters,
): UtilisationReportPremiumPaymentsTabFilters => {
  if (!premiumPaymentsTabFilters) {
    return {};
  }

  const { facilityId } = premiumPaymentsTabFilters;

  const facilityIdFilter = facilityId && REGEX.UKEF_PARTIAL_FACILITY_ID_REGEX.test(facilityId) ? facilityId : undefined;

  return {
    facilityId: facilityIdFilter,
  };
};
