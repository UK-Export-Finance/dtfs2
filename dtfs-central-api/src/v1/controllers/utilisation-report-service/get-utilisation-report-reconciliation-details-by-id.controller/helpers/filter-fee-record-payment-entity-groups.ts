import { PaymentDetailsFilters, PremiumPaymentsFilters } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';

/**
 * Filters the supplied list of fee record payment entity groups by the {@link PremiumPaymentsFilters}.
 * The facility id filter allows for partial matches.
 * @param feeRecordPaymentEntityGroups - A list of fee record payment entity groups to be filtered
 * @param filters - The filters to be applied to the fee record payment data
 * @param filters.facilityId - The facility ID filter
 * @returns The filtered fee record payment entity groups. If no filters are provided, returns the original list.
 */
export const filterFeeRecordPaymentEntityGroupsByPremiumPaymentsFilters = (
  feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[],
  filters: PremiumPaymentsFilters,
): FeeRecordPaymentEntityGroup[] => {
  const { facilityId: facilityIdFilter } = filters;

  if (!facilityIdFilter) {
    return feeRecordPaymentEntityGroups;
  }

  return feeRecordPaymentEntityGroups.filter(({ feeRecords }) => feeRecords.some(({ facilityId }) => facilityId.includes(facilityIdFilter)));
};

/**
 * Filters the supplied list of fee record payment entity groups by the {@link PaymentDetailsFilters}.
 * Payment reference and facility id filters allow for partial matches.
 * These filters are applied cumulatively, meaning if multiple filters are provided,
 * all conditions must be met for a record to be included in the result.
 * @param feeRecordPaymentEntityGroups - A list of fee record payment entity groups to be filtered
 * @param filters - The filters to be applied to the fee record payment data
 * @param filters.facilityId - The facility ID filter
 * @param filters.paymentCurrency - The payment currency filter
 * @param filters.paymentReference - The payment reference filter
 * @returns The filtered fee record payment entity groups. If no filters are provided, returns the original list.
 */
export const filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters = (
  feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[],
  filters: PaymentDetailsFilters,
): FeeRecordPaymentEntityGroup[] => {
  const { facilityId: facilityIdFilter, paymentCurrency: paymentCurrencyFilter, paymentReference: paymentReferenceFilter } = filters;

  return feeRecordPaymentEntityGroups.filter(({ feeRecords, payments }) => {
    const matchesFacilityId = !facilityIdFilter || feeRecords.some(({ facilityId }) => facilityId.includes(facilityIdFilter));

    const matchesPaymentCurrency = !paymentCurrencyFilter || payments.some(({ currency }) => currency === paymentCurrencyFilter);

    const matchesPaymentReference = !paymentReferenceFilter || payments.some(({ reference }) => reference?.includes(paymentReferenceFilter));

    return matchesFacilityId && matchesPaymentCurrency && matchesPaymentReference;
  });
};
