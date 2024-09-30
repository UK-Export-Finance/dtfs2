import { asString, PaymentDetailsFilters, PremiumPaymentsFilters } from '@ukef/dtfs2-common';
import { SessionData } from 'express-session';
import { handleRedirectSessionData } from './handle-redirect-session-data';
import { getIsCheckboxChecked } from './get-is-checkbox-checked';
import { getSelectedFeeRecordIdsFromQuery } from './get-selected-fee-record-ids-from-query';
import { validateFacilityIdQuery } from './validate-facility-id-query';
import { ErrorSummaryViewModel } from '../../../types/view-models';

type PremiumPaymentsQuery = {
  premiumPaymentsFacilityId?: string;
};

type PaymentDetailsQuery = {
  paymentDetailsFacilityId?: string;
  paymentDetailsPaymentReference?: string;
};

type GetUtilisationReportReconciliationQuery = PremiumPaymentsQuery &
  PaymentDetailsQuery & {
    selectedFeeRecordIdsQuery?: string;
  };

/**
 * Parses premium payments filters from the query parameters.
 * @param originalUrl - The original URL of the request.
 * @param queryFilters - The premium payments query filters.
 * @returns An object containing the parsed premium payments filters and any
 * error resulting from validating the facility ID query.
 */
const parsePremiumPaymentsFilters = (originalUrl: string, queryFilters?: PremiumPaymentsQuery) => {
  const facilityIdQueryString = queryFilters?.premiumPaymentsFacilityId
    ? asString(queryFilters.premiumPaymentsFacilityId, 'premiumPaymentsFacilityId')
    : undefined;

  const facilityIdQueryName = 'premiumPaymentsFacilityId';
  const facilityIdInputId = '#premium-payments-facility-id-filter';

  const filterError = validateFacilityIdQuery(originalUrl, facilityIdQueryName, facilityIdInputId, facilityIdQueryString);

  const filters: PremiumPaymentsFilters = {
    facilityId: facilityIdQueryString,
  };

  return {
    premiumPaymentsFilters: filters,
    premiumPaymentsFilterError: filterError,
  };
};

/**
 * Parses payment details filters from the query parameters.
 * @param originalUrl - The original URL of the request.
 * @param queryFilters - The payment details query filters.
 * @returns An object containing the parsed payment details filters and any
 * errors resulting from validating the filter query parameters.
 */
const parsePaymentDetailsFilters = (originalUrl: string, queryFilters?: PaymentDetailsQuery) => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const facilityIdString = queryFilters?.paymentDetailsFacilityId ? asString(queryFilters.paymentDetailsFacilityId, 'paymentDetailsFacilityId') : undefined;

  if (facilityIdString) {
    const facilityIdError = validateFacilityIdQuery(originalUrl, 'paymentDetailsFacilityId', '#payment-details-facility-id-filter', facilityIdString);
    if (facilityIdError) {
      errorSummary.push(facilityIdError);
    }
  }

  const paymentReferenceString = queryFilters?.paymentDetailsPaymentReference
    ? asString(queryFilters.paymentDetailsPaymentReference, 'paymentDetailsPaymentReference')
    : undefined;

  // TODO FN-2311: Add support for payment currency query param.
  // TODO FN-2311: Validate payment currency, push any errors onto errorSummary.

  const filters: PaymentDetailsFilters = {
    facilityId: facilityIdString,
    paymentReference: paymentReferenceString,
  };

  return {
    paymentDetailsFilters: filters,
    paymentDetailsFilterErrors: errorSummary,
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
 * @param queryParams.paymentDetailsFacilityId - The payment details facility
 * ID query parameter
 * @param queryParams.paymentDetailsPaymentReference - The payment details
 * payment reference query parameter
 * @param queryParams.selectedFeeRecordIdsQuery - The selected fee record IDs
 * query parameter
 * @param sessionData - The session data
 * @param originalUrl - The original URL of the request
 * @returns An object containing extracted and processed data including
 * the parsed filters, any errors, and derived values such as
 * isCheckboxChecked.
 */
export const extractQueryAndSessionData = (
  { premiumPaymentsFacilityId, paymentDetailsFacilityId, paymentDetailsPaymentReference, selectedFeeRecordIdsQuery }: GetUtilisationReportReconciliationQuery,
  sessionData: Partial<SessionData>,
  originalUrl: string,
) => {
  const { premiumPaymentsFilters, premiumPaymentsFilterError } = parsePremiumPaymentsFilters(originalUrl, { premiumPaymentsFacilityId });

  const { paymentDetailsFilters, paymentDetailsFilterErrors } = parsePaymentDetailsFilters(originalUrl, {
    paymentDetailsFacilityId,
    paymentDetailsPaymentReference,
  });

  const { premiumPaymentsTableDataError, selectedFeeRecordIds: selectedFeeRecordIdsFromSessionData } = handleRedirectSessionData(sessionData);

  const selectedFeeRecordIdsQueryString = selectedFeeRecordIdsQuery ? asString(selectedFeeRecordIdsQuery, 'selectedFeeRecordIdsQuery') : undefined;

  const selectedFeeRecordIds: Set<number> =
    selectedFeeRecordIdsFromSessionData.size > 0 ? selectedFeeRecordIdsFromSessionData : getSelectedFeeRecordIdsFromQuery(selectedFeeRecordIdsQueryString);

  const isCheckboxChecked = getIsCheckboxChecked(selectedFeeRecordIds);

  return {
    premiumPaymentsFilters,
    premiumPaymentsFilterError,
    premiumPaymentsTableDataError,
    paymentDetailsFilters,
    paymentDetailsFilterErrors,
    isCheckboxChecked,
  };
};
