const {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generateTotalFeesAccruedError,
  generateMonthlyFeesPaidError,
  generatePaymentCurrencyError,
  generateExchangeRateError,
} = require('./utilisation-report-cell-validators');

describe('utilisation-report-cell-validators', () => {
  const testExporterName = 'test-exporter';
  describe('generateUkefFacilityIdError', () => {
    it('returns an error when the value is missing', async () => {
      const nullFacilityId = {
        value: null,
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'UKEF facility ID must have an entry',
        column: 1,
        row: 1,
        value: null,
        exporter: testExporterName,
      };

      const ukefFacilityIdError = generateUkefFacilityIdError(nullFacilityId, testExporterName);

      expect(ukefFacilityIdError).toEqual(expectedError);
    });

    it('returns an error when the value is not a valid UKEF Facility ID', async () => {
      const invalidFacilityId = {
        value: '1234567',
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'UKEF facility ID must be an 8 to 10 digit number',
        column: 1,
        row: 1,
        value: '1234567',
        exporter: testExporterName,
      };

      const ukefFacilityIdError = generateUkefFacilityIdError(invalidFacilityId, testExporterName);

      expect(ukefFacilityIdError).toEqual(expectedError);
    });

    it('returns null if the value is a valid UKEF Facility ID', async () => {
      const validFacilityId = {
        value: '12345678',
        column: 1,
        row: 1,
      };

      const ukefFacilityIdError = generateUkefFacilityIdError(validFacilityId);

      expect(ukefFacilityIdError).toEqual(null);
    });

    it('it returns the correct column and row when an error is found', async () => {
      const invalidFacilityIdWithDifferentRowAndColumn = {
        value: '1234567',
        column: 2,
        row: 3,
      };
      const expectedError = {
        errorMessage: 'UKEF facility ID must be an 8 to 10 digit number',
        column: 2,
        row: 3,
        value: '1234567',
        exporter: testExporterName,
      };

      const ukefFacilityIdError = generateUkefFacilityIdError(invalidFacilityIdWithDifferentRowAndColumn, testExporterName);

      expect(ukefFacilityIdError).toEqual(expectedError);
    });
  });

  describe('generateBaseCurrencyError', () => {
    it('returns an error when the value is missing', async () => {
      const nullBaseCurrency = {
        value: null,
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Base currency must have an entry',
        column: 1,
        row: 1,
        value: null,
        exporter: testExporterName,
      };

      const baseCurrencyError = generateBaseCurrencyError(nullBaseCurrency, testExporterName);

      expect(baseCurrencyError).toEqual(expectedError);
    });

    it('returns an error when the value is not a valid UKEF Facility ID', async () => {
      const invalidBaseCurrency = {
        value: 'GBPA',
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Base currency must be in the ISO 4217 currency code format',
        column: 1,
        row: 1,
        value: 'GBPA',
        exporter: testExporterName,
      };

      const baseCurrencyError = generateBaseCurrencyError(invalidBaseCurrency, testExporterName);

      expect(baseCurrencyError).toEqual(expectedError);
    });

    it('returns null if the value is a valid currency', async () => {
      const validBaseCurrency = {
        value: 'GBP',
        column: 1,
        row: 1,
      };

      const baseCurrencyError = generateBaseCurrencyError(validBaseCurrency, testExporterName);

      expect(baseCurrencyError).toEqual(null);
    });
  });

  describe('generateFacilityUtilisationError', () => {
    it('returns an error when the value is missing', async () => {
      const nullFacilityUtilisation = {
        value: null,
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Facility utilisation must have an entry',
        column: 1,
        row: 1,
        value: null,
        exporter: testExporterName,
      };

      const facilityUtilisationError = generateFacilityUtilisationError(nullFacilityUtilisation, testExporterName);

      expect(facilityUtilisationError).toEqual(expectedError);
    });

    it('returns an error when the value is not a number', async () => {
      const invalidFacilityUtilisation = {
        value: 'abc',
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Facility utilisation must be a number',
        column: 1,
        row: 1,
        value: 'abc',
        exporter: testExporterName,
      };

      const facilityUtilisationError = generateFacilityUtilisationError(invalidFacilityUtilisation, testExporterName);

      expect(facilityUtilisationError).toEqual(expectedError);
    });

    it('returns an error when the value is more than 15 characters', async () => {
      const invalidFacilityUtilisation = {
        value: '1473812445951826593.52',
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Facility utilisation must be 15 characters or less',
        column: 1,
        row: 1,
        value: '1473812445951826593.52',
        exporter: testExporterName,
      };

      const facilityUtilisationError = generateFacilityUtilisationError(invalidFacilityUtilisation, testExporterName);

      expect(facilityUtilisationError).toEqual(expectedError);
    });

    it('returns null if the value is a valid facility utilisation', async () => {
      const validFacilityUtilisation = {
        value: '1000000',
        column: 1,
        row: 1,
      };

      const baseCurrencyError = generateFacilityUtilisationError(validFacilityUtilisation, testExporterName);

      expect(baseCurrencyError).toEqual(null);
    });
  });

  describe('generateTotalFeesAccruedError', () => {
    it('returns an error when the value is missing', async () => {
      const nullTotalFeesAccrued = {
        value: null,
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Total fees accrued for the month must have an entry',
        column: 1,
        row: 1,
        value: null,
        exporter: testExporterName,
      };

      const totalFeesAccruedError = generateTotalFeesAccruedError(nullTotalFeesAccrued, testExporterName);

      expect(totalFeesAccruedError).toEqual(expectedError);
    });

    it('returns an error when the value is not a number', async () => {
      const invalidTotalFeesAccrued = {
        value: 'abc',
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Total fees accrued for the month must be a number',
        column: 1,
        row: 1,
        value: 'abc',
        exporter: testExporterName,
      };

      const totalFeesAccruedError = generateTotalFeesAccruedError(invalidTotalFeesAccrued, testExporterName);

      expect(totalFeesAccruedError).toEqual(expectedError);
    });

    it('returns an error when the value is more than 15 characters', async () => {
      const invalidTotalFeesAccrued = {
        value: '1473812445951826593.52',
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Total fees accrued for the month must be 15 characters or less',
        column: 1,
        row: 1,
        value: '1473812445951826593.52',
        exporter: testExporterName,
      };

      const totalFeesAccruedError = generateTotalFeesAccruedError(invalidTotalFeesAccrued, testExporterName);

      expect(totalFeesAccruedError).toEqual(expectedError);
    });

    it('returns null if the value is a valid total fees accrued', async () => {
      const validTotalFeesAccrued = {
        value: '1000000',
        column: 1,
        row: 1,
      };

      const totalFeesAccruedError = generateTotalFeesAccruedError(validTotalFeesAccrued, testExporterName);

      expect(totalFeesAccruedError).toEqual(null);
    });
  });

  describe('generateMonthlyFeesPaidError', () => {
    it('returns an error when the value is missing', async () => {
      const nullMonthlyFeesPaid = {
        value: null,
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Monthly fees paid to UKEF must have an entry',
        column: 1,
        row: 1,
        value: null,
        exporter: testExporterName,
      };

      const monthlyFeesPaidError = generateMonthlyFeesPaidError(nullMonthlyFeesPaid, testExporterName);

      expect(monthlyFeesPaidError).toEqual(expectedError);
    });

    it('returns an error when the value is not a number', async () => {
      const invalidMonthlyFeesPaid = {
        value: 'abc',
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Monthly fees paid to UKEF must be a number',
        column: 1,
        row: 1,
        value: 'abc',
        exporter: testExporterName,
      };

      const monthlyFeesPaidError = generateMonthlyFeesPaidError(invalidMonthlyFeesPaid, testExporterName);

      expect(monthlyFeesPaidError).toEqual(expectedError);
    });

    it('returns an error when the value is more than 15 characters', async () => {
      const invalidMonthlyFeesPaid = {
        value: '1473812445951826593.52',
        column: 1,
        row: 1,
      };
      const expectedError = {
        errorMessage: 'Monthly fees paid to UKEF must be 15 characters or less',
        column: 1,
        row: 1,
        value: '1473812445951826593.52',
        exporter: testExporterName,
      };

      const monthlyFeesPaidError = generateMonthlyFeesPaidError(invalidMonthlyFeesPaid, testExporterName);

      expect(monthlyFeesPaidError).toEqual(expectedError);
    });

    it('returns null if the value is a valid monthly fees paid', async () => {
      const validMonthlyFeesPaid = {
        value: '1000000',
        column: 1,
        row: 1,
      };

      const monthlyFeesPaidError = generateMonthlyFeesPaidError(validMonthlyFeesPaid, testExporterName);

      expect(monthlyFeesPaidError).toEqual(null);
    });
  });
});
