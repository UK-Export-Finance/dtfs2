import { PaymentDetailsFilters } from '@ukef/dtfs2-common';
import { REGEX } from '../../../constants';
import { ErrorSummaryViewModel, PaymentDetailsFilterErrorsViewModel } from '../../../types/view-models';

/**
 * Validates if the facility ID filter is valid.
 * @param originalUrl - The original URL of the request.
 * @param facilityIdQuery - The facility ID query string.
 * @returns True if the facility ID filter is valid, false otherwise.
 */
export const isFacilityIdFilterValid = (originalUrl: string, facilityIdQuery: string): boolean => {
  return originalUrl.includes('paymentDetailsFacilityId') && REGEX.INT.test(facilityIdQuery) && REGEX.PARTIAL_FACILITY_ID.test(facilityIdQuery);
};

/**
 * Validates if the payment currency filter is valid.
 * @param originalUrl - The original URL of the request.
 * @param paymentCurrencyQuery - The payment currency query string.
 * @returns True if the payment currency filter is valid, false otherwise.
 */
export const isPaymentCurrencyFilterValid = (originalUrl: string, paymentCurrencyQuery: string): boolean => {
  // TODO FN-2311: CURRENCY_REGEX will be exported as part of PR 3573 - https://github.com/UK-Export-Finance/dtfs2/pull/3573/files
  return originalUrl.includes('paymentDetailsPaymentCurrency') && !!paymentCurrencyQuery; // && CURRENCY_REGEX.test(paymentCurrencyQuery);
};

/**
 * Validates if the payment reference filter is valid.
 * @param originalUrl - The original URL of the request.
 * @param paymentReferenceQuery - The payment reference query string.
 * @returns True if the payment reference filter is valid, false otherwise.
 */
export const isPaymentReferenceFilterValid = (originalUrl: string, paymentReferenceQuery: string): boolean => {
  return originalUrl.includes('paymentDetailsPaymentReference') && paymentReferenceQuery.length >= 4;
};

/**
 * Validates the payment details filters and returns any error messages.
 * @param originalUrl - The original URL of the request.
 * @param filters - The payment details filters to validate.
 * @returns An object containing error messages for invalid filters.
 */
export const validatePaymentDetailsFilters = (originalUrl: string, filters: PaymentDetailsFilters): PaymentDetailsFilterErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  let facilityIdErrorMessage;
  if (filters.facilityId && !isFacilityIdFilterValid(originalUrl, filters.facilityId)) {
    facilityIdErrorMessage = 'Facility ID must be blank or contain between 4 and 10 numbers';

    errorSummary.push({ text: facilityIdErrorMessage, href: '#payment-details-facility-id-filter' });
  }

  let paymentCurrencyErrorMessage;
  if (filters.paymentCurrency && !isPaymentCurrencyFilterValid(originalUrl, filters.paymentCurrency)) {
    paymentCurrencyErrorMessage = 'Payment currency must be blank or a supported currency';

    // TODO FN-2311: Need to add support for this anchor href.
    errorSummary.push({ text: paymentCurrencyErrorMessage, href: '#payment-details-payment-currency-filter' });
  }

  let paymentReferenceErrorMessage;
  if (filters.paymentReference && !isPaymentReferenceFilterValid(originalUrl, filters.paymentReference)) {
    paymentReferenceErrorMessage = 'Payment reference must be blank or contain a minimum of 4 characters';

    errorSummary.push({ text: paymentReferenceErrorMessage, href: '#payment-details-payment-reference-filter' });
  }

  return {
    errorSummary,
    facilityIdErrorMessage,
    paymentCurrencyErrorMessage,
    paymentReferenceErrorMessage,
  };
};
