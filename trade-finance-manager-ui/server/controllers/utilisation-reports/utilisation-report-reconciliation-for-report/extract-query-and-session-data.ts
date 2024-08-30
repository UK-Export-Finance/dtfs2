import { asString } from '@ukef/dtfs2-common';
import { Request } from 'express';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { getIsCheckboxChecked } from './get-is-checkbox-checked';
import { getSelectedFeeRecordIdsFromQuery } from './get-selected-fee-record-ids-from-query';
import { validateFacilityIdQuery } from './validate-facility-id-query';

/**
 * Extracts and processes query parameters and session data from the request.
 *
 * Extracts selected fee record IDs from query parameters or session data.
 * Prioritizes query parameters if available, falling back to session data.
 * This handles cases where the user was redirected from another page.
 *
 * @param req - The request object
 * @returns An object containing extracted and processed data including
 * facilityIdQueryString, filterError, tableDataError, and derived values
 * such as isCheckboxChecked.
 */
export const extractQueryAndSessionData = (req: Request) => {
  const { facilityIdQuery, selectedFeeRecordIds: selectedFeeRecordIdsQuery } = req.query;

  const facilityIdQueryString = facilityIdQuery ? asString(facilityIdQuery, 'facilityIdQuery') : undefined;

  const filterError = validateFacilityIdQuery(facilityIdQueryString, req.originalUrl);

  const { tableDataError, selectedFeeRecordIds: selectedFeeRecordIdsFromSessionData } = getAndClearFieldsFromRedirectSessionData(req);

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
