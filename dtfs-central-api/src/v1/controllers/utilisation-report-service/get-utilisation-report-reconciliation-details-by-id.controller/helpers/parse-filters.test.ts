import { CURRENCY } from '@ukef/dtfs2-common';
import { isPaymentReferenceFilterLengthValid, parsePaymentDetailsFilters, parsePremiumPaymentsFilters } from './parse-filters';

describe('parse-filters helper', () => {
  describe('parsePaymentDetailsFilters', () => {
    describe('when paymentDetailsFilters is undefined', () => {
      it('should return an empty object', () => {
        // Arrange
        const expected = {};

        // Act
        const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters();

        // Assert
        expect(paymentDetailsTabParsedFilters).toEqual(expected);
      });
    });

    describe('when all valid filters are provided', () => {
      it('should return an object with all valid filters', () => {
        // Arrange

        const validFacilityId = '987654321';
        const validPaymentCurrency = CURRENCY.GBP;
        const validPaymentReference = 'Valid reference';

        const paymentDetailsFilters = {
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
    });

    describe('facility id', () => {
      describe('when facilityId is undefined', () => {
        it('should return an object with undefined facilityId', () => {
          // Arrange
          const paymentDetailsFilters = { facilityId: undefined };
          const expected = paymentDetailsFilters;

          // Act
          const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

          // Assert
          expect(paymentDetailsTabParsedFilters).toEqual(expected);
        });
      });

      describe('when a valid facilityId is provided', () => {
        it('should return an object with valid facilityId', () => {
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

      describe('when an invalid facilityId is provided', () => {
        it('should return an object with undefined facilityId', () => {
          // Arrange
          const paymentDetailsFilters = { facilityId: 'invalid-facility-id' };
          const expected = { facilityId: undefined };

          // Act
          const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

          // Assert
          expect(paymentDetailsTabParsedFilters).toEqual(expected);
        });
      });
    });

    describe('payment currency', () => {
      describe('when paymentCurrency is undefined', () => {
        it('should return an object with undefined paymentCurrency', () => {
          // Arrange
          const paymentDetailsFilters = { paymentCurrency: undefined };
          const expected = paymentDetailsFilters;

          // Act
          const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

          // Assert
          expect(paymentDetailsTabParsedFilters).toEqual(expected);
        });
      });

      describe('when a valid paymentCurrency is provided', () => {
        it('should return an object with valid paymentCurrency', () => {
          // Arrange
          const paymentDetailsFilters = { paymentCurrency: CURRENCY.GBP };
          const expected = paymentDetailsFilters;

          // Act
          const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

          // Assert
          expect(paymentDetailsTabParsedFilters).toEqual(expected);
        });
      });

      describe('when an invalid paymentCurrency is provided', () => {
        it('should return an object with undefined paymentCurrency', () => {
          // Arrange
          const paymentDetailsFilters = { paymentCurrency: 'invalid-currency' };
          const expected = {};

          // Act
          const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

          // Assert
          expect(paymentDetailsTabParsedFilters).toEqual(expected);
        });
      });
    });

    describe('payment reference', () => {
      describe('when paymentReference is undefined', () => {
        it('should return an object with undefined paymentReference', () => {
          // Arrange
          const paymentDetailsFilters = { paymentReference: undefined };
          const expected = paymentDetailsFilters;

          // Act
          const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

          // Assert
          expect(paymentDetailsTabParsedFilters).toEqual(expected);
        });
      });

      describe('when a valid paymentReference is provided', () => {
        it('should return an object with valid paymentReference', () => {
          // Arrange
          const validPaymentReference = 'A valid payment reference';
          const paymentDetailsFilters = { paymentReference: validPaymentReference };
          const expected = paymentDetailsFilters;

          // Act
          const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

          // Assert
          expect(paymentDetailsTabParsedFilters).toEqual(expected);
        });
      });

      describe('when an invalid paymentReference is provided', () => {
        it('should return an object with undefined paymentReference', () => {
          // Arrange
          const paymentDetailsFilters = { paymentReference: 'a-very-long-payment-reference-that-is-invalid-due-to-its-length' };
          const expected = { paymentReference: undefined };

          // Act
          const paymentDetailsTabParsedFilters = parsePaymentDetailsFilters(paymentDetailsFilters);

          // Assert
          expect(paymentDetailsTabParsedFilters).toEqual(expected);
        });
      });
    });
  });

  describe('parsePremiumPaymentsFilters', () => {
    describe('when premiumPaymentsFilters is undefined', () => {
      it('should return an empty object', () => {
        // Arrange
        const expected = {};

        // Act
        const premiumPaymentsTabParsedFilters = parsePremiumPaymentsFilters();

        // Assert
        expect(premiumPaymentsTabParsedFilters).toEqual(expected);
      });
    });

    describe('facility id', () => {
      describe('when facilityId is undefined', () => {
        it('should return an object with undefined facilityId', () => {
          // Arrange
          const premiumPaymentsFilters = { facilityId: undefined };
          const expected = premiumPaymentsFilters;

          // Act
          const premiumPaymentsTabParsedFilters = parsePremiumPaymentsFilters(premiumPaymentsFilters);

          // Assert
          expect(premiumPaymentsTabParsedFilters).toEqual(expected);
        });
      });

      describe('when a valid facilityId is provided', () => {
        it('should return an object with valid facilityId', () => {
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

      describe('when an invalid facilityId is provided', () => {
        it('should return an object with undefined facilityId', () => {
          // Arrange
          const premiumPaymentsFilters = { facilityId: 'invalid-facility-id' };
          const expected = { facilityId: undefined };

          // Act
          const premiumPaymentsTabParsedFilters = parsePremiumPaymentsFilters(premiumPaymentsFilters);

          // Assert
          expect(premiumPaymentsTabParsedFilters).toEqual(expected);
        });
      });
    });
  });

  describe('isPaymentReferenceBetweenFourAndFiftyCharacters', () => {
    describe('when payment reference is less than 4 characters', () => {
      it('should return false', () => {
        const result = isPaymentReferenceFilterLengthValid('123');
        expect(result).toEqual(false);
      });
    });

    describe('when payment reference is exactly 4 characters', () => {
      it('should return true', () => {
        const result = isPaymentReferenceFilterLengthValid('1234');
        expect(result).toEqual(true);
      });
    });

    describe('when payment reference is between 4 and 50 characters', () => {
      it('should return true', () => {
        const result = isPaymentReferenceFilterLengthValid('This is a string with exactly 44 characters.');
        expect(result).toEqual(true);
      });
    });

    describe('when payment reference is exactly 50 characters', () => {
      it('should return true', () => {
        const result = isPaymentReferenceFilterLengthValid('This is a string with exactly 50 characters.......');
        expect(result).toEqual(true);
      });
    });

    describe('when payment reference is more than 50 characters', () => {
      it('should return false', () => {
        const paymentReference = 'This is a string with exactly 51 characters........';

        const result = isPaymentReferenceFilterLengthValid(paymentReference);

        expect(result).toEqual(false);
      });
    });
  });
});
