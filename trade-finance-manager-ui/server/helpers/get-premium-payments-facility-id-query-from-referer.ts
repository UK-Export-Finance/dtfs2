/**
 * Regular expression to extract the premium payments facility ID from a URL query string.
 * The pattern uses {4,10} to match between 4 and 10 digits, ensuring the facility ID
 * is at least 4 digits long but no more than 10 digits.
 * The matched digits are captured in a named group 'premiumPaymentsFacilityId'.
 */
const PREMIUM_PAYMENTS_FACILITY_ID_QUERY_REGEX = /premiumPaymentsFacilityId=(?<premiumPaymentsFacilityId>\d{4,10})/;

/**
 * Extracts the premium payments facility ID from the referer header.
 * @param req - The Express request object.
 * @returns The extracted facility ID or undefined if not found or invalid.
 */
export const getPremiumPaymentsFacilityIdQueryFromReferer = (referer?: string): string | undefined => {
  if (!referer) {
    return undefined;
  }

  const captureGroups = PREMIUM_PAYMENTS_FACILITY_ID_QUERY_REGEX.exec(referer)?.groups;
  if (!captureGroups) {
    return undefined;
  }
  return captureGroups.premiumPaymentsFacilityId;
};
