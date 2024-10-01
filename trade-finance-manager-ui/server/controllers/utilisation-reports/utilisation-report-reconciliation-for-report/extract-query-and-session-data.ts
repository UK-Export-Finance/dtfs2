import { asString, PremiumPaymentsFilters } from '@ukef/dtfs2-common';
import { SessionData } from 'express-session';
import { handleRedirectSessionData } from './handle-redirect-session-data';
import { getIsCheckboxChecked } from './get-is-checkbox-checked';
import { getSelectedFeeRecordIdsFromQuery } from './get-selected-fee-record-ids-from-query';
import { validateFacilityIdQuery } from './validate-facility-id-query';

type GetUtilisationReportReconciliationQuery = {
  premiumPaymentsFacilityId?: string;
  selectedFeeRecordIdsQuery?: string;
};

/**
 * Parses premium payments filters from the query parameters.
 * @param originalUrl - The original URL of the request.
 * @param premiumPaymentsFacilityId - The premium payments facility ID query.
 * @returns An object containing the parsed premium payments filters and any
 * error resulting from validating the facility ID query.
 */
const parsePremiumPaymentsFilters = (originalUrl: string, facilityIdQuery?: string) => {
  const facilityIdQueryString = facilityIdQuery ? asString(facilityIdQuery, 'facilityIdQuery') : undefined;

  const filters: PremiumPaymentsFilters = {
    facilityId: facilityIdQueryString,
  };

  const facilityIdInputId = '#premium-payments-facility-id-filter';

  const filterError = validateFacilityIdQuery(facilityIdQueryString, originalUrl, facilityIdInputId);

  return {
    premiumPaymentsFilters: filters,
    premiumPaymentsFilterError: filterError,
  };
};

/**
 * Extracts and processes query parameters and session data.
 *
 * Extracts selected fee record IDs from query parameters or session data.
 * Prioritises query parameters if available, falling back to session data.
 * This handles cases where the user was redirected from another page.
 *
 * @param queryParams - The request query parameters object
 * @param queryParams.premiumPaymentsFacilityId - The premium payments facility
 * ID query parameter
 * @param queryParams.selectedFeeRecordIdsQuery - The selected fee record IDs
 * query parameter
 * @param sessionData - The session data
 * @param originalUrl - The original URL of the request
 * @returns An object containing extracted and processed data including
 * premiumPaymentsFilters, premiumPaymentsFilterError,
 * premiumPaymentsTableDataError, and derived values such as isCheckboxChecked.
 */
export const extractQueryAndSessionData = (
  { premiumPaymentsFacilityId, selectedFeeRecordIdsQuery }: GetUtilisationReportReconciliationQuery,
  sessionData: Partial<SessionData>,
  originalUrl: string,
) => {
  const { premiumPaymentsFilters, premiumPaymentsFilterError } = parsePremiumPaymentsFilters(originalUrl, premiumPaymentsFacilityId);

  const { premiumPaymentsTableDataError, selectedFeeRecordIds: selectedFeeRecordIdsFromSessionData } = handleRedirectSessionData(sessionData);

  const selectedFeeRecordIdsQueryString = selectedFeeRecordIdsQuery ? asString(selectedFeeRecordIdsQuery, 'selectedFeeRecordIdsQuery') : undefined;

  const selectedFeeRecordIds: Set<number> =
    selectedFeeRecordIdsFromSessionData.size > 0 ? selectedFeeRecordIdsFromSessionData : getSelectedFeeRecordIdsFromQuery(selectedFeeRecordIdsQueryString);

  const isCheckboxChecked = getIsCheckboxChecked(selectedFeeRecordIds);

  return {
    premiumPaymentsFilters,
    premiumPaymentsFilterError,
    premiumPaymentsTableDataError,
    isCheckboxChecked,
  };
};
