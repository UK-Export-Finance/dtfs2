import { PaymentDetailsFilters } from '@ukef/dtfs2-common';

/**
 * Constructs href to payment details tab with selected filters
 * @param activeFilters - the filters which should be selected on page load
 * @param reportId - the report id
 * @returns Constructed href
 */
export const getPaymentDetailsTabHref = (activeFilters: PaymentDetailsFilters, reportId: string) => {
  const baseHref = `/utilisation-reports/${reportId}`;
  const tab = '#payment-details';
  const activeFilterQueries = [];

  if (activeFilters.facilityId) {
    activeFilterQueries.push(`paymentDetailsFacilityId=${activeFilters.facilityId}`);
  }

  if (activeFilters.paymentCurrency) {
    activeFilterQueries.push(`paymentDetailsPaymentCurrency=${activeFilters.paymentCurrency}`);
  }

  if (activeFilters.paymentReference) {
    activeFilterQueries.push(`paymentDetailsPaymentReference=${activeFilters.paymentReference}`);
  }

  if (activeFilterQueries.length === 0) {
    return baseHref.concat(tab);
  }

  return baseHref.concat('?', activeFilterQueries.join('&'), tab);
};
