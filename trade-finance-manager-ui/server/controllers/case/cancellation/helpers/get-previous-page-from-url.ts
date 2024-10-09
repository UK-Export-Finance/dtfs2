/**
 * Validates the if the provided URL is one of
 *  - reason for cancelling page
 *  - bank request date page
 *  - effective from date page
 *  - check details page
 *
 * and returns a new relative URL for that page.
 * Otherwise, returns the deal summary page URL.
 * @param url - The URL of the previous page, provided in the post request
 * @param dealId - The deal id
 * @returns the previous page URL
 */
export const getPreviousPageFromUrl = (url: string, dealId: string): string => {
  const previousPages = ['reason', 'bank-request-date', 'effective-from-date', 'check-details'];

  const previousPageUrl = previousPages.reduce((existingValue: string | undefined, currentValue: string) => {
    if (url.includes(`/case/${dealId}/cancellation/${currentValue}`)) {
      return `/case/${dealId}/cancellation/${currentValue}`;
    }

    return existingValue;
  }, undefined);

  return previousPageUrl ?? `/case/${dealId}/deal`;
};
