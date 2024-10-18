import { PaymentDetailsFilters } from '@ukef/dtfs2-common';
import { SelectedPaymentDetailsFiltersViewModel } from '../../../types/view-models';

export const getPaymentDetailsTabHref = (activeFilters: PaymentDetailsFilters) => {
  const baseHref = '/utilisation-reports/100001231';
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
    return baseHref + tab;
  }

  return baseHref.concat('?', activeFilterQueries.join('&'), tab);
};

export const mapToSelectedPaymentDetailsFiltersViewModel = (filters: PaymentDetailsFilters): SelectedPaymentDetailsFiltersViewModel => {
  return {
    facilityId: filters.facilityId ? { value: filters.facilityId, removeHref: getPaymentDetailsTabHref({ ...filters, facilityId: undefined }) } : null,
    paymentCurrency: filters.paymentCurrency
      ? { value: filters.paymentCurrency, removeHref: getPaymentDetailsTabHref({ ...filters, paymentCurrency: undefined }) }
      : null,
    paymentReference: filters.paymentReference
      ? { value: filters.paymentReference, removeHref: getPaymentDetailsTabHref({ ...filters, paymentReference: undefined }) }
      : null,
  };
};
