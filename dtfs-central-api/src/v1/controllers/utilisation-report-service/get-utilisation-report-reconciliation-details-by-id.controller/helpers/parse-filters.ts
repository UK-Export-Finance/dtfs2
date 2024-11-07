import {
  Currency,
  CURRENCY_REGEX,
  isPaymentReferenceOverMaxCharacterCount,
  MIN_PAYMENT_REFERENCE_FILTER_CHARACTER_COUNT,
  PaymentDetailsFilters,
  PremiumPaymentsFilters,
  ValidatedPaymentDetailsFilters,
} from '@ukef/dtfs2-common';
import { REGEX } from '../../../../../constants';

/**
 * Checks if the payment reference is defined and has a valid length between
 * {@link MIN_PAYMENT_REFERENCE_FILTER_CHARACTER_COUNT} and
 * {@link @ukef/dtfs2-common#MAX_PAYMENT_REFERENCE_CHARACTER_COUNT}.
 * @param paymentReference - The payment reference string to check.
 * @returns True if the payment reference is defined and has a valid length, false otherwise.
 */
export const isPaymentReferenceFilterLengthValid = (paymentReference?: string): boolean => {
  return (
    !!paymentReference && paymentReference.length >= MIN_PAYMENT_REFERENCE_FILTER_CHARACTER_COUNT && !isPaymentReferenceOverMaxCharacterCount(paymentReference)
  );
};

/**
 * Parses the provided payment details tab filters to test validity.
 * @param paymentDetailsFilters - The filters to be applied to the fee record payment data
 * @param paymentDetailsFilters.facilityId - The facility ID filter
 * @param paymentDetailsFilters.paymentCurrency - The payment currency filter
 * @param paymentDetailsFilters.paymentReference - The payment reference filter
 * @returns The parsed filters for the payment details tab
 */
export const parsePaymentDetailsFilters = (paymentDetailsFilters?: PaymentDetailsFilters): ValidatedPaymentDetailsFilters => {
  if (!paymentDetailsFilters) {
    return {};
  }

  const { facilityId, paymentCurrency, paymentReference } = paymentDetailsFilters;

  let facilityIdFilter;

  if (facilityId && REGEX.UKEF_PARTIAL_FACILITY_ID_REGEX.test(facilityId)) {
    facilityIdFilter = facilityId;
  }

  let paymentReferenceFilter;

  if (isPaymentReferenceFilterLengthValid(paymentReference)) {
    paymentReferenceFilter = paymentReference;
  }

  let paymentCurrencyFilter: Currency | undefined;

  if (paymentCurrency && CURRENCY_REGEX.test(paymentCurrency)) {
    paymentCurrencyFilter = paymentCurrency as Currency;
  }

  return {
    facilityId: facilityIdFilter,
    paymentReference: paymentReferenceFilter,
    paymentCurrency: paymentCurrencyFilter,
  };
};

/**
 * Parses the provided premium payments tab filters to test validity.
 * @param premiumPaymentsFilters - The unparsed filters to be applied for the premium payments table
 * @param premiumPaymentsFilters.facilityId - The facility ID filter
 * @returns The parsed filters for the premium payments tab
 */
export const parsePremiumPaymentsFilters = (premiumPaymentsFilters?: PremiumPaymentsFilters): PremiumPaymentsFilters => {
  if (!premiumPaymentsFilters || !premiumPaymentsFilters.facilityId) {
    return {};
  }

  const { facilityId } = premiumPaymentsFilters;

  let facilityIdFilter;

  if (REGEX.UKEF_PARTIAL_FACILITY_ID_REGEX.test(facilityId)) {
    facilityIdFilter = facilityId;
  }

  return {
    facilityId: facilityIdFilter,
  };
};
