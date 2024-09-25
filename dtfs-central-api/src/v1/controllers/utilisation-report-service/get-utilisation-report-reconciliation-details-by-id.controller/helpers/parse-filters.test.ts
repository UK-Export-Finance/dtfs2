import { PaymentDetailsFilters } from '@ukef/dtfs2-common';
import { parsePaymentDetailsFilters, parsePremiumPaymentsFilters } from './parse-filters';

describe('parse-filters helper', () => {
  describe('parsePaymentDetailsFilters', () => {
    it('returns an empty object when paymentDetailsFilters is undefined', () => {
      // Arrange
      const expected = {};

      // Act
      const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters();

      // Assert
      expect(paymentDetailsTabParsedFilters).toEqual(expected);
    });

    it('returns an object with all valid filters when all valid filters are provided', () => {
      // Arrange
      const validFacilityId = '987654321';
      const validPaymentCurrency = 'GBP';
      const validPaymentReference = 'Valid reference';

      const paymentDetailsFilters: PaymentDetailsFilters = {
        facilityId: validFacilityId,
        paymentCurrency: validPaymentCurrency,
        paymentReference: validPaymentReference,
      };
      const expected = paymentDetailsFilters;

      // Act
      const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

      // Assert
      expect(paymentDetailsTabParsedFilters).toEqual(expected);
    });

    describe('facility id', () => {
      it('returns an object with undefined facilityId when an invalid facilityId is provided', () => {
        // Arrange
        const paymentDetailsFilters = { facilityId: 'invalid-facility-id' };
        const expected = { facilityId: undefined };

        // Act
        const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

        // Assert
        expect(paymentDetailsTabParsedFilters).toEqual(expected);
      });

      it('returns an object with valid facilityId when a valid facilityId is provided', () => {
        // Arrange
        const validFacilityId = '123456789';
        const paymentDetailsFilters = { facilityId: validFacilityId };
        const expected = paymentDetailsFilters;

        // Act
        const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

        // Assert
        expect(paymentDetailsTabParsedFilters).toEqual(expected);
      });
    });

    describe('payment currency', () => {
      it('returns an object with undefined paymentCurrency when paymentCurrency is undefined', () => {
        // Arrange
        const paymentDetailsFilters: PaymentDetailsFilters = { paymentCurrency: undefined };
        const expected = paymentDetailsFilters;

        // Act
        const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

        // Assert
        expect(paymentDetailsTabParsedFilters).toEqual(expected);
      });

      it('returns an object with valid paymentCurrency when a valid paymentCurrency is provided', () => {
        // Arrange
        const validPaymentCurrency = 'GBP';
        const paymentDetailsFilters: PaymentDetailsFilters = { paymentCurrency: validPaymentCurrency };
        const expected = paymentDetailsFilters;

        // Act
        const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

        // Assert
        expect(paymentDetailsTabParsedFilters).toEqual(expected);
      });
    });

    describe('payment reference', () => {
      it('returns an object with undefined paymentReference when an invalid paymentReference is provided', () => {
        // Arrange
        const paymentDetailsFilters: PaymentDetailsFilters = { paymentReference: 'a-very-long-payment-reference-that-is-invalid-due-to-its-length' };
        const expected = { paymentReference: undefined };

        // Act
        const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

        // Assert
        expect(paymentDetailsTabParsedFilters).toEqual(expected);
      });

      it('returns an object with valid paymentReference when a valid paymentReference is provided', () => {
        // Arrange
        const validPaymentReference = 'A valid payment reference';
        const paymentDetailsFilters: PaymentDetailsFilters = { paymentReference: validPaymentReference };
        const expected = paymentDetailsFilters;

        // Act
        const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

        // Assert
        expect(paymentDetailsTabParsedFilters).toEqual(expected);
      });
    });
  });

  describe('parsePremiumPaymentsFilters', () => {
    it('returns an empty object when premiumPaymentsFilters is undefined', () => {
      // Arrange
      const expected = {};

      // Act
      const premiumPaymentsTabParsedFilters = parsePremiumPaymentsFilters();

      // Assert
      expect(premiumPaymentsTabParsedFilters).toEqual(expected);
    });

    describe('facility id', () => {
      it('returns an object with undefined facilityId when an invalid facilityId is provided', () => {
        // Arrange
        const premiumPaymentsFilters = { facilityId: 'invalid-facility-id' };
        const expected = { facilityId: undefined };

        // Act
        const premiumPaymentsTabParsedFilters = parsePremiumPaymentsFilters(premiumPaymentsFilters);

        // Assert
        expect(premiumPaymentsTabParsedFilters).toEqual(expected);
      });

      it('returns an object with valid facilityId when a valid facilityId is provided', () => {
        // Arrange
        const validFacilityId = '123456789';
        const premiumPaymentsFilters = { facilityId: validFacilityId };
        const expected = premiumPaymentsFilters;

        // Act
        const premiumPaymentsTabParsedFilters = parsePremiumPaymentsFilters(premiumPaymentsFilters);

        // Assert
        expect(premiumPaymentsTabParsedFilters).toEqual(expected);
      });
    });
  });
});
