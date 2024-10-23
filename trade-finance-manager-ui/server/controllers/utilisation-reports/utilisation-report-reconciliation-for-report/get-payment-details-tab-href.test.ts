import { CURRENCY } from '@ukef/dtfs2-common';
import { getPaymentDetailsTabHref } from './get-payment-details-tab-href';

describe('get-payment-details-tab-href', () => {
  describe('getPaymentDetailsTabHref', () => {
    const reportId = '1234';

    describe('when no filters are active', () => {
      it('should return href to payment details tab with no query params', () => {
        // Arrange
        const activeFilters = {};

        // Act
        const href = getPaymentDetailsTabHref(activeFilters, reportId);

        // Assert
        expect(href).toEqual(`/utilisation-reports/${reportId}#payment-details`);
      });
    });

    describe('when payment currency filter is active', () => {
      it('should return href to payment details tab with payment currency query param', () => {
        // Arrange
        const paymentCurrencyFilter = CURRENCY.GBP;
        const activeFilters = { paymentCurrency: paymentCurrencyFilter };

        // Act
        const href = getPaymentDetailsTabHref(activeFilters, reportId);

        // Assert
        expect(href).toEqual(`/utilisation-reports/${reportId}?paymentDetailsPaymentCurrency=${paymentCurrencyFilter}#payment-details`);
      });
    });

    describe('when payment reference filter is active', () => {
      it('should return href to payment details tab with payment reference query param', () => {
        // Arrange
        const paymentReferenceFilter = 'a reference';
        const activeFilters = { paymentReference: paymentReferenceFilter };

        // Act
        const href = getPaymentDetailsTabHref(activeFilters, reportId);

        // Assert
        expect(href).toEqual(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${paymentReferenceFilter}#payment-details`);
      });
    });

    describe('when facility id filter is active', () => {
      it('should return href to payment details tab with facility id query param', () => {
        // Arrange
        const facilityIdFilter = '12345';
        const activeFilters = { facilityId: facilityIdFilter };

        // Act
        const href = getPaymentDetailsTabHref(activeFilters, reportId);

        // Assert
        expect(href).toEqual(`/utilisation-reports/${reportId}?paymentDetailsFacilityId=${facilityIdFilter}#payment-details`);
      });
    });

    describe('when multiple filters are active', () => {
      it('should return href to payment details tab with multiple query params', () => {
        // Arrange
        const paymentCurrencyFilter = CURRENCY.GBP;
        const paymentReferenceFilter = 'a reference';
        const facilityIdFilter = '12345';
        const activeFilters = {
          facilityId: facilityIdFilter,
          paymentCurrency: paymentCurrencyFilter,
          paymentReference: paymentReferenceFilter,
        };

        // Act
        const href = getPaymentDetailsTabHref(activeFilters, reportId);

        // Assert
        expect(href).toEqual(
          `/utilisation-reports/${reportId}?paymentDetailsFacilityId=${facilityIdFilter}&paymentDetailsPaymentCurrency=${paymentCurrencyFilter}&paymentDetailsPaymentReference=${paymentReferenceFilter}#payment-details`,
        );
      });
    });
  });
});
