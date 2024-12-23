import { CURRENCY } from '@ukef/dtfs2-common';
import { mapToSelectedPaymentDetailsFiltersViewModel } from './map-to-selected-payment-details-filters-view-model';
import { getPaymentDetailsTabHref } from './get-payment-details-tab-href';

describe('map-to-selected-payment-details-filters-view-model', () => {
  const reportId = '123';

  describe('mapToSelectedPaymentDetailsFiltersViewModel', () => {
    it('should return null if no filters are active', () => {
      // Arrange
      const filters = {};

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      expect(result).toBeNull();
    });

    it('should not set facilityId selected filter when no facility id provided', () => {
      // Arrange
      const filters = { paymentCurrency: CURRENCY.USD, paymentReference: 'REF123' };

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      expect(result!.facilityId).toBeUndefined();
    });

    it('should not set paymentCurrency selected filter when no payment currency provided', () => {
      // Arrange
      const filters = { facilityId: '1234', paymentReference: 'REF123' };

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      expect(result!.paymentCurrency).toBeUndefined();
    });

    it('should not set paymentReference selected filter when no payment reference provided', () => {
      // Arrange
      const filters = { facilityId: '1234', paymentCurrency: CURRENCY.USD };

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      expect(result!.paymentReference).toBeUndefined();
    });

    it('should set facilityId selected filter value to the facility id when facility id provided', () => {
      // Arrange
      const filters = { facilityId: '12345' };

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      expect(result!.facilityId!.value).toEqual('12345');
    });

    it('should set paymentCurrency selected filter value to the payment currency when payment currency provided', () => {
      // Arrange
      const filters = { paymentCurrency: CURRENCY.JPY };

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      expect(result!.paymentCurrency!.value).toEqual(CURRENCY.JPY);
    });

    it('should set paymentReference selected filter value to the payment reference when payment reference provided', () => {
      // Arrange
      const filters = { paymentReference: 'REF123' };

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      expect(result!.paymentReference!.value).toEqual('REF123');
    });

    it('should set facilityId remove href to link to report with other active filters still applied', () => {
      // Arrange
      const filters = { facilityId: '12345', paymentReference: 'REF123', paymentCurrency: CURRENCY.USD };

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      const expected = getPaymentDetailsTabHref({ paymentReference: 'REF123', paymentCurrency: CURRENCY.USD }, reportId);
      expect(result!.facilityId!.removeHref).toEqual(expected);
    });

    it('should set paymentCurrency remove href to link to report with other active filters still applied', () => {
      // Arrange
      const filters = { facilityId: '12345', paymentReference: 'REF123', paymentCurrency: CURRENCY.USD };

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      const expected = getPaymentDetailsTabHref({ facilityId: '12345', paymentReference: 'REF123' }, reportId);
      expect(result!.paymentCurrency!.removeHref).toEqual(expected);
    });

    it('should set paymentReference remove href to link to report with other active filters still applied', () => {
      // Arrange
      const filters = { facilityId: '12345', paymentReference: 'REF123', paymentCurrency: CURRENCY.USD };

      // Act
      const result = mapToSelectedPaymentDetailsFiltersViewModel(filters, reportId);

      // Assert
      const expected = getPaymentDetailsTabHref({ facilityId: '12345', paymentCurrency: CURRENCY.USD }, reportId);
      expect(result!.paymentReference!.removeHref).toEqual(expected);
    });
  });
});
