import { PaymentDetailsFilters } from '@ukef/dtfs2-common';
import { SelectedPaymentDetailsFiltersViewModel } from '../../../types/view-models';
import { getPaymentDetailsTabHref } from './get-payment-details-tab-href';

/**
 * Map to selected payment details filters view model
 * @param filters - The filter values
 * @param reportId - The report id
 * @returns the selected payment details filters view model
 */
export const mapToSelectedPaymentDetailsFiltersViewModel = (
  filters: PaymentDetailsFilters,
  reportId: string,
): SelectedPaymentDetailsFiltersViewModel | null => {
  if (!filters.facilityId && !filters.paymentCurrency && !filters.paymentReference) {
    return null;
  }
  return {
    facilityId: filters.facilityId
      ? { value: filters.facilityId, removeHref: getPaymentDetailsTabHref({ ...filters, facilityId: undefined }, reportId) }
      : null,
    paymentCurrency: filters.paymentCurrency
      ? { value: filters.paymentCurrency, removeHref: getPaymentDetailsTabHref({ ...filters, paymentCurrency: undefined }, reportId) }
      : null,
    paymentReference: filters.paymentReference
      ? { value: filters.paymentReference, removeHref: getPaymentDetailsTabHref({ ...filters, paymentReference: undefined }, reportId) }
      : null,
  };
};
