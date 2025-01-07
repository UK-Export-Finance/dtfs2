import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

/**
 * Validates if the provided URL is one of
 *  - PORTAL AMENDMENT PAGES
 *
 * and returns a new relative URL for that page.
 * Otherwise, returns the deal summary page URL.
 * @param url - The URL of the previous page, provided in the post request
 * @param dealId - The deal id
 * @param facilityId - The facility id
 * @param amendmentId - The amendment id
 * @returns the previous page URL
 */
export const getPreviousPageUrl = (url: string, dealId: string, facilityId: string, amendmentId: string): string => {
  const previousPages = Object.values(PORTAL_AMENDMENT_PAGES);

  const previousPageUrl = previousPages.reduce((existingValue: string | undefined, currentValue: string) => {
    const urlSuffix = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${currentValue}`;
    if (url.includes(urlSuffix)) {
      return urlSuffix;
    }

    return existingValue;
  }, undefined);

  return previousPageUrl ?? `/gef/application-details/${dealId}`;
};
