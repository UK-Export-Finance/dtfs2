import { PaymentDetailsFilters } from '@ukef/dtfs2-common';
import { SelectedPaymentDetailsFiltersViewModel } from '../../../types/view-models';

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

export const mapToSelectedPaymentDetailsFiltersViewModel = (filters: PaymentDetailsFilters, reportId: string): SelectedPaymentDetailsFiltersViewModel => {
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
