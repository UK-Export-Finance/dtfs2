import { PORTAL_AMENDMENT_STATUS, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
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
  MANUAL_APPROVAL_NEEDED,
  SUBMITTED_FOR_CHECKING,
} = PORTAL_AMENDMENT_PAGES;

const startPages = [WHAT_DO_YOU_NEED_TO_CHANGE] as const;
const endPages = [EFFECTIVE_DATE, CHECK_YOUR_ANSWERS] as const;
const coverEndDatePages = [COVER_END_DATE, DO_YOU_HAVE_A_FACILITY_END_DATE] as const;

/**
 * @param dealId - the deal ID
 * @param facilityId - the facility ID
 * @param amendmentId - the amendment ID
 * @param page - the amendments page
 * @returns the url for the given amendments page
 */
export const getAmendmentsUrl = ({
  dealId,
  facilityId,
  amendmentId,
  page,
}: {
  dealId: string;
  facilityId: string;
  amendmentId: string;
  page: PortalAmendmentPage;
}) => {
  return `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`;
};

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

  pages.push(ELIGIBILITY);

  if (amendment.eligibilityCriteria.criteria.some((criterion) => criterion.answer === false)) {
    pages.push(MANUAL_APPROVAL_NEEDED);
  } else {
    pages.push(...endPages);
  }

  if (amendment.status === PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL) {
    pages.push(SUBMITTED_FOR_CHECKING);
  }

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

  const { dealId, facilityId, amendmentId } = amendment;
  const page = journey[currentPageIndex - 1];

  return getAmendmentsUrl({ dealId, facilityId, amendmentId, page });
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

  const { dealId, facilityId, amendmentId } = amendment;
  const page = journey[currentPageIndex + 1];

  return getAmendmentsUrl({ dealId, facilityId, amendmentId, page });
};
