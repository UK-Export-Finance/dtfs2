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
export const getPreviousPageUrlForCancelCancellation = (url: string, dealId: string): string => {
  const previousPages = ['reason', 'bank-request-date', 'effective-from-date', 'check-details'];

  const previousPageUrl = previousPages.reduce((existingValue: string | undefined, currentValue: string) => {
    if (url.includes(`/case/${dealId}/cancellation/${currentValue}`)) {
      return `/case/${dealId}/cancellation/${currentValue}`;
    }

    return existingValue;
  }, undefined);

  return previousPageUrl ?? `/case/${dealId}/deal`;
};

/**
 * Gets the previous page URL to pass into the back link on the general deal cancellation flow.
 * This ensures that if the user has reached a page by clicking 'Change' on the check details page, then they are redirected back to that page.
 *
 * @param dealId - The deal ID
 * @param defaultPreviousPage string - the expected previous page in the deal cancellation flow
 * @param status - 'change' if user comes from the check details page, otherwise undefined
 */
export const getPreviousPageUrlForCancellationFlow = (dealId: string, defaultPreviousPage: string, status?: string): string => {
  const baseUrl = `/case/${dealId}`;
  const checkDetailsPage = `/cancellation/check-details`;
  return baseUrl + (status === 'change' ? checkDetailsPage : defaultPreviousPage);
};
