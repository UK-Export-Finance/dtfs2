import { REGEX } from '@ukef/dtfs2-common';

/**
 * Extracts the premium payments facility ID from the referer.
 * @param referer - The referer request header.
 * @returns The extracted facility ID or undefined if not found or invalid.
 */
export const getPremiumPaymentsFacilityIdQueryFromReferer = (referer?: string): string | undefined => {
  if (!referer) {
    return undefined;
  }

  const captureGroups = REGEX.PREMIUM_PAYMENTS_FACILITY_ID_QUERY_REGEX.exec(referer)?.groups;
  if (!captureGroups) {
    return undefined;
  }
  return captureGroups.premiumPaymentsFacilityId;
};
