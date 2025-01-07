import { PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalAmendmentPage } from '../../../types/portal-amendments';

const {
  WHAT_DO_YOU_NEED_TO_CHANGE,
  COVER_END_DATE,
  DO_YOU_HAVE_A_FACILITY_END_DATE,
  FACILITY_END_DATE,
  BANK_REVIEW_DATE,
  FACILITY_VALUE,
  ELIGIBILITY,
  EFFECTIVE_DATE,
  CHECK_YOUR_ANSWERS,
} = PORTAL_AMENDMENT_PAGES;

const startPages = [WHAT_DO_YOU_NEED_TO_CHANGE] as const;
const endPages = [ELIGIBILITY, EFFECTIVE_DATE, CHECK_YOUR_ANSWERS] as const;
const coverEndDatePages = [COVER_END_DATE, DO_YOU_HAVE_A_FACILITY_END_DATE] as const;

/**
 * @param amendment - the amendment
 * @returns the pages that should be displayed for this amendment if the user is changing the cover end date
 */
const getCoverEndDatePages = (amendment: PortalFacilityAmendmentWithUkefId): PortalAmendmentPage[] => {
  return [...coverEndDatePages, amendment.isUsingFacilityEndDate ? FACILITY_END_DATE : BANK_REVIEW_DATE];
};

/**
 * @param amendment - the amendment
 * @returns the pages for this amendment in the order the user should visit them
 */
const getJourneyForAmendment = (amendment: PortalFacilityAmendmentWithUkefId): PortalAmendmentPage[] => {
  const pages: PortalAmendmentPage[] = [...startPages];

  if (amendment.changeCoverEndDate) {
    pages.push(...getCoverEndDatePages(amendment));
  }

  if (amendment.changeFacilityValue) {
    pages.push(FACILITY_VALUE);
  }

  pages.push(...endPages);

  return pages;
};

/**
 *
 * @param currentPage - the current page
 * @param amendment - the amendment
 * @returns the previous page in the journey for this amendment
 */
export const getPreviousPage = (currentPage: PortalAmendmentPage, amendment: PortalFacilityAmendmentWithUkefId): string => {
  const journey = getJourneyForAmendment(amendment);

  const currentPageIndex = journey.indexOf(currentPage);

  if (currentPageIndex === 0 || currentPageIndex === -1) {
    throw new Error(`Cannot get previous page for ${currentPage}`);
  }

  return `/gef/application-details/${amendment.dealId}/facilities/${amendment.facilityId}/amendments/${amendment.amendmentId}/${journey[currentPageIndex - 1]}`;
};

/**
 * @param currentPage - the current page
 * @param amendment - the amendment
 * @returns the next page in the journey for this amendment
 */
export const getNextPage = (currentPage: PortalAmendmentPage, amendment: PortalFacilityAmendmentWithUkefId): string => {
  const journey = getJourneyForAmendment(amendment);

  const currentPageIndex = journey.indexOf(currentPage);

  if (currentPageIndex >= journey.length - 1 || currentPageIndex === -1) {
    throw new Error(`Cannot get next page for ${currentPage}`);
  }

  return `/gef/application-details/${amendment.dealId}/facilities/${amendment.facilityId}/amendments/${amendment.amendmentId}/${journey[currentPageIndex + 1]}`;
};
