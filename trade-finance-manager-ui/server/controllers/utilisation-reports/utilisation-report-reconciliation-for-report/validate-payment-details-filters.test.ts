import { CURRENCY } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel, PaymentDetailsFilterErrorsViewModel } from '../../../types/view-models';
import {
  isFacilityIdFilterValid,
  isPaymentCurrencyFilterValid,
  isPaymentReferenceFilterValid,
  validatePaymentDetailsFilters,
} from './validate-payment-details-filters';

describe('controllers/utilisation-reports/utilisation-report-reconciliation-for-report/validate-payment-details-filters', () => {
  describe('isFacilityIdFilterValid', () => {
    describe('when the original URL includes paymentDetailsFacilityId', () => {
      const originalUrl = 'http://example.com?paymentDetailsFacilityId=12345';

      it('should return true for a valid facility ID', () => {
        expect(isFacilityIdFilterValid(originalUrl, '12345')).toBe(true);
      });

      it('should return false for a facility ID with less than 4 digits', () => {
        expect(isFacilityIdFilterValid(originalUrl, '123')).toBe(false);
      });

      it('should return false for a facility ID with more than 10 digits', () => {
        expect(isFacilityIdFilterValid(originalUrl, '12345678901')).toBe(false);
      });

      it('should return false for a facility ID containing non-numeric characters', () => {
        expect(isFacilityIdFilterValid(originalUrl, '1234a')).toBe(false);
      });
    });

    describe('when the original URL does not include paymentDetailsFacilityId', () => {
      const originalUrl = 'http://example.com';

      it('should return false even for a valid facility ID', () => {
        expect(isFacilityIdFilterValid(originalUrl, '12345')).toBe(false);
      });
    });
  });

  describe('isPaymentCurrencyFilterValid', () => {
    describe('when the original URL includes paymentDetailsPaymentCurrency', () => {
      const originalUrl = 'http://example.com?paymentDetailsPaymentCurrency=USD';

      it('should return true for a non-empty payment currency', () => {
        expect(isPaymentCurrencyFilterValid(originalUrl, CURRENCY.USD)).toBe(true);
      });

      it('should return false for an empty payment currency', () => {
        expect(isPaymentCurrencyFilterValid(originalUrl, '')).toBe(false);
      });

      it('should return false for an unknown payment currency', () => {
        expect(isPaymentCurrencyFilterValid(originalUrl, 'ABC')).toBe(false);
      });
    });

    describe('when the original URL does not include paymentDetailsPaymentCurrency', () => {
      const originalUrl = 'http://example.com';

      it('should return false even for a valid payment currency', () => {
        expect(isPaymentCurrencyFilterValid(originalUrl, CURRENCY.USD)).toBe(false);
      });
    });
  });

  describe('isPaymentReferenceFilterValid', () => {
    describe('when the original URL includes paymentDetailsPaymentReference', () => {
      const originalUrl = 'http://example.com?paymentDetailsPaymentReference=REF123';

      it('should return true for a non-empty payment reference', () => {
        expect(isPaymentReferenceFilterValid(originalUrl, 'REF123')).toBe(true);
      });

      it('should return false for a payment reference with less than 4 characters', () => {
        expect(isPaymentReferenceFilterValid(originalUrl, 'ABC')).toBe(false);
      });

      it('should return false for an empty payment reference', () => {
        expect(isPaymentReferenceFilterValid(originalUrl, '')).toBe(false);
      });
    });

    describe('when the original URL does not include paymentDetailsPaymentReference', () => {
      const originalUrl = 'http://example.com';

      it('should return false even for a valid payment reference', () => {
        expect(isPaymentReferenceFilterValid(originalUrl, 'REF123')).toBe(false);
      });
    });
  });

  describe('validatePaymentDetailsFilters', () => {
    describe('when all filters are valid', () => {
      it('should return an object with an empty errorSummary', () => {
        // Arrange
        const filters = {
          facilityId: '1234',
          paymentCurrency: CURRENCY.GBP,
          paymentReference: 'REF123',
        };
        const originalUrl = 'http://example.com?paymentDetailsFacilityId=1234&paymentDetailsPaymentCurrency=GBP&paymentDetailsPaymentReference=REF123';

        // Act
        const result = validatePaymentDetailsFilters(originalUrl, filters);

        // Assert
        expect(result.errorSummary).toHaveLength(0);
        expect(result.facilityIdErrorMessage).toBeUndefined();
        expect(result.paymentCurrencyErrorMessage).toBeUndefined();
        expect(result.paymentReferenceErrorMessage).toBeUndefined();
      });
    });

    describe('when facility id is invalid', () => {
      it('should return an object with facilityIdErrorMessage and errorSummary', () => {
        // Arrange
        const filters = {
          facilityId: '123',
          paymentCurrency: CURRENCY.GBP,
          paymentReference: 'REF123',
        };
        const originalUrl = 'http://example.com?paymentDetailsFacilityId=123&paymentDetailsPaymentCurrency=GBP&paymentDetailsPaymentReference=REF123';

        const expectedFacilityIdErrorMessage = 'Facility ID must be blank or contain between 4 and 10 numbers';

        // Act
        const result = validatePaymentDetailsFilters(originalUrl, filters);

        // Assert
        expect(result.errorSummary).toEqual([
          {
            text: expectedFacilityIdErrorMessage,
            href: '#payment-details-facility-id-filter',
          },
        ]);
        expect(result.facilityIdErrorMessage).toEqual(expectedFacilityIdErrorMessage);
        expect(result.paymentCurrencyErrorMessage).toBeUndefined();
        expect(result.paymentReferenceErrorMessage).toBeUndefined();
      });
    });

    describe('when payment currency is invalid', () => {
      it('should return an object with paymentCurrencyErrorMessage and errorSummary', () => {
        // Arrange
        const filters = {
          facilityId: '1234',
          paymentCurrency: 'INVALID',
          paymentReference: 'REF123',
        };
        const originalUrl = 'http://example.com?paymentDetailsFacilityId=1234&paymentDetailsPaymentCurrency=INVALID&paymentDetailsPaymentReference=REF123';

        const expectedPaymentCurrencyErrorMessage = 'Payment currency must be unselected or one of the options';

        // Act
        const result = validatePaymentDetailsFilters(originalUrl, filters);

        // Assert
        expect(result.errorSummary).toEqual([
          {
            text: expectedPaymentCurrencyErrorMessage,
            href: '#payment-details-payment-currency-filter',
          },
        ]);
        expect(result.facilityIdErrorMessage).toBeUndefined();
        expect(result.paymentCurrencyErrorMessage).toEqual(expectedPaymentCurrencyErrorMessage);
        expect(result.paymentReferenceErrorMessage).toBeUndefined();
      });
    });

    describe('when payment reference is invalid', () => {
      it('should return an object with paymentReferenceErrorMessage and errorSummary', () => {
        // Arrange
        const filters = {
          facilityId: '1234',
          paymentCurrency: CURRENCY.GBP,
          paymentReference: 'ABC',
        };
        const originalUrl = 'http://example.com?paymentDetailsFacilityId=1234&paymentDetailsPaymentCurrency=GBP&paymentDetailsPaymentReference=ABC';

        const expectedPaymentReferenceErrorMessage = 'Payment reference must be blank or contain a minimum of 4 characters';

        // Act
        const result = validatePaymentDetailsFilters(originalUrl, filters);

        // Assert
        expect(result.errorSummary).toEqual([
          {
            text: expectedPaymentReferenceErrorMessage,
            href: '#payment-details-payment-reference-filter',
          },
        ]);
        expect(result.facilityIdErrorMessage).toBeUndefined();
        expect(result.paymentCurrencyErrorMessage).toBeUndefined();
        expect(result.paymentReferenceErrorMessage).toEqual(expectedPaymentReferenceErrorMessage);
      });
    });

    describe('when all filters are invalid', () => {
      it('should return an object with all error messages and errorSummary', () => {
        // Arrange
        const filters = {
          facilityId: 'INVALID',
          paymentCurrency: 'INVALID',
          paymentReference: 'ABC',
        };
        const originalUrl = 'http://example.com?paymentDetailsFacilityId=INVALID&paymentDetailsPaymentCurrency=INVALID&paymentDetailsPaymentReference=ABC';

        const expectedFacilityIdErrorMessage = 'Facility ID must be blank or contain between 4 and 10 numbers';
        const expectedPaymentCurrencyErrorMessage = 'Payment currency must be unselected or one of the options';
        const expectedPaymentReferenceErrorMessage = 'Payment reference must be blank or contain a minimum of 4 characters';

        const expectedErrorSummary: ErrorSummaryViewModel[] = [
          {
            href: '#payment-details-payment-currency-filter',
            text: expectedPaymentCurrencyErrorMessage,
          },
          {
            href: '#payment-details-payment-reference-filter',
            text: expectedPaymentReferenceErrorMessage,
          },
          {
            href: '#payment-details-facility-id-filter',
            text: expectedFacilityIdErrorMessage,
          },
        ];

        const expectedFilterErrors: PaymentDetailsFilterErrorsViewModel = {
          errorSummary: expectedErrorSummary,
          facilityIdErrorMessage: expectedFacilityIdErrorMessage,
          paymentCurrencyErrorMessage: expectedPaymentCurrencyErrorMessage,
          paymentReferenceErrorMessage: expectedPaymentReferenceErrorMessage,
        };

        // Act
        const result = validatePaymentDetailsFilters(originalUrl, filters);

        // Assert
        expect(result).toEqual(expectedFilterErrors);
      });
    });

    describe('when original URL does not include filter query parameters', () => {
      it('should return an object with all error messages and errorSummary', () => {
        // Arrange
        const filters = {
          facilityId: '1234',
          paymentCurrency: CURRENCY.GBP,
          paymentReference: 'REF123',
        };
        const originalUrl = 'http://example.com';

        const expectedFacilityIdErrorMessage = 'Facility ID must be blank or contain between 4 and 10 numbers';
        const expectedPaymentCurrencyErrorMessage = 'Payment currency must be unselected or one of the options';
        const expectedPaymentReferenceErrorMessage = 'Payment reference must be blank or contain a minimum of 4 characters';

        const expectedErrorSummary: ErrorSummaryViewModel[] = [
          {
            href: '#payment-details-payment-currency-filter',
            text: expectedPaymentCurrencyErrorMessage,
          },
          {
            href: '#payment-details-payment-reference-filter',
            text: expectedPaymentReferenceErrorMessage,
          },
          {
            href: '#payment-details-facility-id-filter',
            text: expectedFacilityIdErrorMessage,
          },
        ];

        const expectedFilterErrors: PaymentDetailsFilterErrorsViewModel = {
          errorSummary: expectedErrorSummary,
          facilityIdErrorMessage: expectedFacilityIdErrorMessage,
          paymentCurrencyErrorMessage: expectedPaymentCurrencyErrorMessage,
          paymentReferenceErrorMessage: expectedPaymentReferenceErrorMessage,
        };

        // Act
        const result = validatePaymentDetailsFilters(originalUrl, filters);

        // Assert

        expect(result).toEqual(expectedFilterErrors);
      });
    });
  });
});
