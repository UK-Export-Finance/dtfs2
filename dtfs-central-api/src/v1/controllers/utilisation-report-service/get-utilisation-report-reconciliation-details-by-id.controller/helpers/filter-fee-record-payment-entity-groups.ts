import { Currency, PremiumPaymentsFilters } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';
import { ValidatedPaymentDetailsFilters } from '../../../../../types/utilisation-reports';

/**
 * All possible filters for FeeRecordPaymentGroup filtering.
 */
type Filters = PremiumPaymentsFilters & ValidatedPaymentDetailsFilters;

/**
 * Represents a function that filters FeeRecordPaymentEntityGroup objects.
 * The Filterer should return true if the group satisfies the filter the Filterer is implementing.
 * @param group The FeeRecordPaymentEntityGroup to be filtered.
 * @returns A boolean indicating whether the group satisfies the filter.
 */
type Filterer = (group: FeeRecordPaymentEntityGroup) => boolean;

/**
 * Creates a filterer function for filtering FeeRecordPaymentEntityGroups based on facility ID.
 * @param facilityIdFilter - The facility ID to filter by. Partial matches are allowed.
 * @returns A Filterer function that returns true if any fee record in the group has a facility ID that includes the filter string.
 */
export const getFacilityIdFilterer = (facilityIdFilter: string): Filterer => {
  return (group: FeeRecordPaymentEntityGroup) => group.feeRecords.some(({ facilityId }) => facilityId.includes(facilityIdFilter));
};

/**
 * Creates a filterer function for filtering FeeRecordPaymentEntityGroups based on payment currency.
 * @param paymentCurrencyFilter - The payment currency to filter by. Exact matches are required.
 * @returns A Filterer function that returns true if any payment in the group has a currency that exactly matches the filter.
 */
export const getPaymentCurrencyFilterer = (paymentCurrencyFilter: Currency): Filterer => {
  return (group: FeeRecordPaymentEntityGroup) => group.payments.some(({ currency }) => currency === paymentCurrencyFilter);
};

/**
 * Creates a filterer function for filtering FeeRecordPaymentEntityGroups based on payment reference.
 * @param paymentReferenceFilter - The payment reference to filter by. Partial matches are allowed.
 * @returns A Filterer function that returns true if any payment in the group has a reference that includes the filter string.
 */
export const getPaymentReferenceFilterer = (paymentReferenceFilter: string): Filterer => {
  return (group: FeeRecordPaymentEntityGroup) => group.payments.some(({ reference }) => reference?.includes(paymentReferenceFilter));
};

/**
 * Filters the supplied list of fee record payment entity groups based on the provided filters.
 *
 * This function applies the following filters:
 * - Facility ID: Allows partial matches.
 * - Payment Currency: Requires exact matches.
 * - Payment Reference: Allows partial matches.
 *
 * These filters are applied cumulatively, meaning all specified conditions must be met
 * for a group to be included in the result.
 *
 * @param feeRecordPaymentEntityGroups - An array of fee record payment entity groups to be filtered.
 * @param filters - An object containing the filter criteria.
 * @param filters.facilityId - Optional. The facility ID to filter by (partial match).
 * @param filters.paymentCurrency - Optional. The payment currency to filter by (exact match).
 * @param filters.paymentReference - Optional. The payment reference to filter by (partial match).
 * @returns An array of filtered fee record payment entity groups. If no filters are provided, returns the original array.
 */
export const filterFeeRecordPaymentEntityGroups = (
  feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[],
  filters: Filters,
): FeeRecordPaymentEntityGroup[] => {
  const { facilityId: facilityIdFilter, paymentCurrency: paymentCurrencyFilter, paymentReference: paymentReferenceFilter } = filters;

  const filterers: Filterer[] = [];

  if (facilityIdFilter) {
    filterers.push(getFacilityIdFilterer(facilityIdFilter));
  }

  if (paymentCurrencyFilter) {
    filterers.push(getPaymentCurrencyFilterer(paymentCurrencyFilter));
  }

  if (paymentReferenceFilter) {
    filterers.push(getPaymentReferenceFilterer(paymentReferenceFilter));
  }

  return feeRecordPaymentEntityGroups.filter((group) => {
    return filterers.every((filterer) => filterer(group));
  });
};
