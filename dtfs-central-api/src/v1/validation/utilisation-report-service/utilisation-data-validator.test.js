const {
  validateUkefId,
  validateExporter,
  validateBaseCurrency,
  validateFacilityUtilisation,
  validateTotalFeesAccrued,
  validateMonthlyFeesPaid,
  validatePaymentCurrency,
  validateExchangeRate,
} = require('./utilisation-data-validator');

describe('utilisation-data-validator', () => {
  describe('validateUkefId', () => {
    it('returns null when a valid UKEF ID is provided', async () => {
      const validationError = validateUkefId('28374891');

      expect(validationError).toEqual(null);
    });

    it('returns null when no UKEF ID is provided', async () => {
      const validationError = validateUkefId(undefined);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect UKEF ID is provided', async () => {
      const validationError = validateUkefId('11');

      expect(validationError).toEqual('UKEF ID must be an 8 digit number');
    });
  });

  describe('validateExporter', () => {
    it('returns null when a valid exporter is provided', async () => {
      const validationError = validateExporter('test exporter');

      expect(validationError).toEqual(null);
    });

    it('returns null when no exporter is provided', async () => {
      const validationError = validateExporter(undefined);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect exporter is provided', async () => {
      const validationError = validateExporter({});

      expect(validationError).toEqual('Exporter must be a string');
    });
  });

  describe('validateBaseCurrency', () => {
    it('returns null when a valid currency is provided', async () => {
      const validationError = validateBaseCurrency('GBP');

      expect(validationError).toEqual(null);
    });

    it('returns null when no currency is provided', async () => {
      const validationError = validateBaseCurrency(undefined);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect currency is provided', async () => {
      const validationError = validateBaseCurrency('AWD');

      expect(validationError).toEqual('Base currency must be an ISO 4217 currency code');
    });
  });

  describe('validateFacilityUtilisation', () => {
    it('returns null when a valid monetary value is provided', async () => {
      const validationError = validateFacilityUtilisation(25003.23);

      expect(validationError).toEqual(null);
    });

    it('returns null when no monetary value is provided', async () => {
      const validationError = validateFacilityUtilisation(undefined);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect monetary value is provided', async () => {
      const validationError = validateFacilityUtilisation('test');

      expect(validationError).toEqual('Facility utilisation must be a monetary value');
    });
  });

  describe('validateTotalFeesAccrued', () => {
    it('returns null when a valid monetary value is provided', async () => {
      const validationError = validateTotalFeesAccrued(25003.23);

      expect(validationError).toEqual(null);
    });

    it('returns null when no monetary value is provided', async () => {
      const validationError = validateTotalFeesAccrued(undefined);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect monetary value is provided', async () => {
      const validationError = validateTotalFeesAccrued('test');

      expect(validationError).toEqual('Total fees accrued must be a monetary value');
    });
  });

  describe('validateMonthlyFeesPaid', () => {
    it('returns null when a valid monetary value is provided', async () => {
      const validationError = validateMonthlyFeesPaid(25003.23);

      expect(validationError).toEqual(null);
    });

    it('returns null when no monetary value is provided', async () => {
      const validationError = validateMonthlyFeesPaid(undefined);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect monetary value is provided', async () => {
      const validationError = validateMonthlyFeesPaid('test');

      expect(validationError).toEqual('Monthly fees paid must be a monetary value');
    });
  });

  describe('validatePaymentCurrency', () => {
    it('returns null when a valid currency is provided', async () => {
      const validationError = validatePaymentCurrency('GBP');

      expect(validationError).toEqual(null);
    });

    it('returns null when no currency is provided', async () => {
      const validationError = validatePaymentCurrency(undefined);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect currency is provided', async () => {
      const validationError = validatePaymentCurrency('test');

      expect(validationError).toEqual('Payment currency must be an ISO 4217 currency code');
    });
  });

  describe('validateExchangeRate', () => {
    it('returns null when a valid exchange rate is provided', async () => {
      const validationError = validateExchangeRate(0.783642);

      expect(validationError).toEqual(null);
    });

    it('returns null when no exchange rate is provided', async () => {
      const validationError = validateExchangeRate(undefined);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect exchange rate is provided', async () => {
      const validationError = validateExchangeRate('test');

      expect(validationError).toEqual('Exchange rate must be a number representing an exchange rate');
    });
  });
});
