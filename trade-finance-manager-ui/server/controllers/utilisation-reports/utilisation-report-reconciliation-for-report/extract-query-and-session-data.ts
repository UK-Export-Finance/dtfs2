import { asString } from '@ukef/dtfs2-common';
import { SessionData } from 'express-session';
import { handleRedirectSessionData } from './handle-redirect-session-data';
import { getIsCheckboxChecked } from './get-is-checkbox-checked';
import { getSelectedFeeRecordIdsFromQuery } from './get-selected-fee-record-ids-from-query';
import { validateFacilityIdQuery } from './validate-facility-id-query';

type GetUtilisationReportReconciliationQuery = {
  facilityIdQuery?: string;
  selectedFeeRecordIdsQuery?: string;
};

/**
 * Extracts and processes query parameters and session data.
 *
 * Extracts selected fee record IDs from query parameters or session data.
 * Prioritizes query parameters if available, falling back to session data.
 * This handles cases where the user was redirected from another page.
 *
 * @param queryParams - The request query parameters object
 * @param queryParams.facilityIdQuery - The facility ID query parameter
 * @param queryParams.selectedFeeRecordIdsQuery - The selected fee record IDs
 * query parameter
 * @param sessionData - The session data
 * @param originalUrl - The original URL of the request
 * @returns An object containing extracted and processed data including
 * facilityIdQueryString, filterError, tableDataError, and derived values
 * such as isCheckboxChecked.
 */
export const extractQueryAndSessionData = (
  { facilityIdQuery, selectedFeeRecordIdsQuery }: GetUtilisationReportReconciliationQuery,
  sessionData: Partial<SessionData>,
  originalUrl: string,
) => {
  const facilityIdQueryString = facilityIdQuery ? asString(facilityIdQuery, 'facilityIdQuery') : undefined;

  const filterError = validateFacilityIdQuery(facilityIdQueryString, originalUrl);

  const { tableDataError, selectedFeeRecordIds: selectedFeeRecordIdsFromSessionData } = handleRedirectSessionData(sessionData);

  const selectedFeeRecordIdsQueryString = selectedFeeRecordIdsQuery ? asString(selectedFeeRecordIdsQuery, 'selectedFeeRecordIdsQuery') : undefined;

  const selectedFeeRecordIds: Set<number> =
    selectedFeeRecordIdsFromSessionData.size > 0 ? selectedFeeRecordIdsFromSessionData : getSelectedFeeRecordIdsFromQuery(selectedFeeRecordIdsQueryString);

  const isCheckboxChecked = getIsCheckboxChecked(selectedFeeRecordIds);

  return {
    facilityIdQueryString,
    filterError,
    tableDataError,
    isCheckboxChecked,
  };
};
