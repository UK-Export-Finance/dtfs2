import {
  validateUkefId,
  validateExporter,
  validateBaseCurrency,
  validateFacilityUtilisation,
  validateTotalFeesAccrued,
  validateTotalFeesAccruedCurrency,
  validateTotalFeesAccruedExchangeRate,
  validateMonthlyFeesPaid,
  validateMonthlyFeesPaidCurrency,
  validatePaymentCurrency,
  validatePaymentExchangeRate,
} from './utilisation-data-validator';

describe('utilisation-data-validator', () => {
  describe('validateUkefId', () => {
    it('returns null when a valid UKEF ID is provided', async () => {
      const validationError = validateUkefId('28374891', 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no UKEF ID is provided', async () => {
      const validationError = validateUkefId(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect UKEF ID is provided', async () => {
      const validationError = validateUkefId('11', 1);

      expect(validationError).toEqual({ index: 1, error: 'UKEF ID must be a string of 8-10 digits' });
    });
  });

  describe('validateExporter', () => {
    it('returns null when a valid exporter is provided', async () => {
      const validationError = validateExporter('test exporter', 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no exporter is provided', async () => {
      const validationError = validateExporter(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect exporter is provided', async () => {
      const validationError = validateExporter({}, 1);

      expect(validationError).toEqual({ index: 1, error: 'Exporter must be a string' });
    });
  });

  describe('validateBaseCurrency', () => {
    it('returns null when a valid currency is provided', async () => {
      const validationError = validateBaseCurrency('GBP', 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no currency is provided', async () => {
      const validationError = validateBaseCurrency(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect currency is provided', async () => {
      const validationError = validateBaseCurrency('AWD', 1);

      expect(validationError).toEqual({ index: 1, error: 'Base currency must be an ISO 4217 currency code' });
    });
  });

  describe('validateFacilityUtilisation', () => {
    it('returns null when a valid monetary value is provided', async () => {
      const validationError = validateFacilityUtilisation(25003.23, 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no monetary value is provided', async () => {
      const validationError = validateFacilityUtilisation(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect monetary value is provided', async () => {
      const validationError = validateFacilityUtilisation('test', 1);

      expect(validationError).toEqual({ index: 1, error: 'Facility utilisation must be a monetary value' });
    });
  });

  describe('validateTotalFeesAccrued', () => {
    it('returns null when a valid monetary value is provided', async () => {
      const validationError = validateTotalFeesAccrued(25003.23, 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no monetary value is provided', async () => {
      const validationError = validateTotalFeesAccrued(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect monetary value is provided', async () => {
      const validationError = validateTotalFeesAccrued('test', 1);

      expect(validationError).toEqual({ index: 1, error: 'Total fees accrued must be a monetary value' });
    });
  });

  describe('validateTotalFeesAccruedCurrency', () => {
    it('returns null when a valid currency is provided', async () => {
      const validationError = validateTotalFeesAccruedCurrency('GBP', 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no currency is provided', async () => {
      const validationError = validateTotalFeesAccruedCurrency(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect currency is provided', async () => {
      const validationError = validateTotalFeesAccruedCurrency('AWD', 1);

      expect(validationError).toEqual({
        index: 1,
        error: 'Total fees accrued currency must be an ISO 4217 currency code',
      });
    });
  });

  describe('validateTotalFeesAccruedExchangeRate', () => {
    it('returns null when a valid exchange rate is provided', async () => {
      const validationError = validateTotalFeesAccruedExchangeRate(0.783642, 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no exchange rate is provided', async () => {
      const validationError = validateTotalFeesAccruedExchangeRate(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect exchange rate is provided', async () => {
      const validationError = validateTotalFeesAccruedExchangeRate('test', 1);

      expect(validationError).toEqual({
        index: 1,
        error: 'Total fees accrued exchange rate must be a number representing an exchange rate',
      });
    });
  });

  describe('validateMonthlyFeesPaid', () => {
    it('returns null when a valid monetary value is provided', async () => {
      const validationError = validateMonthlyFeesPaid(25003.23, 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no monetary value is provided', async () => {
      const validationError = validateMonthlyFeesPaid(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect monetary value is provided', async () => {
      const validationError = validateMonthlyFeesPaid('test', 1);

      expect(validationError).toEqual({ index: 1, error: 'Monthly fees paid must be a monetary value' });
    });
  });

  describe('validateMonthlyFeesPaidCurrency', () => {
    it('returns null when a valid currency is provided', async () => {
      const validationError = validateMonthlyFeesPaidCurrency('GBP', 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no currency is provided', async () => {
      const validationError = validateMonthlyFeesPaidCurrency(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect currency is provided', async () => {
      const validationError = validateMonthlyFeesPaidCurrency('AWD', 1);

      expect(validationError).toEqual({
        index: 1,
        error: 'Monthly fees paid currency must be an ISO 4217 currency code',
      });
    });
  });

  describe('validatePaymentCurrency', () => {
    it('returns null when a valid currency is provided', async () => {
      const validationError = validatePaymentCurrency('GBP', 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no currency is provided', async () => {
      const validationError = validatePaymentCurrency(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect currency is provided', async () => {
      const validationError = validatePaymentCurrency('test', 1);

      expect(validationError).toEqual({ index: 1, error: 'Payment currency must be an ISO 4217 currency code' });
    });
  });

  describe('validatePaymentExchangeRate', () => {
    it('returns null when a valid exchange rate is provided', async () => {
      const validationError = validatePaymentExchangeRate(0.783642, 1);

      expect(validationError).toEqual(null);
    });

    it('returns null when no exchange rate is provided', async () => {
      const validationError = validatePaymentExchangeRate(undefined, 1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when an incorrect exchange rate is provided', async () => {
      const validationError = validatePaymentExchangeRate('test', 1);

      expect(validationError).toEqual({
        index: 1,
        error: 'Payment exchange rate must be a number representing an exchange rate',
      });
    });
  });
});
