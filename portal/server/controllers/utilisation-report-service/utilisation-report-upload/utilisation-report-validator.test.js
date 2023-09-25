const { validateCsvHeaders } = require('./utilisation-report-validator');

describe('utilisation-report-validator', () => {
  describe('validateCsvHeaders', () => {
    it('returns an error if a header is missing', async () => {
      const csvDataRowWithMissingHeader = {
        'bank facility reference': { value: 'Britannia Energy GEF', columnIndex: 0 },
        exporter: { value: 'Britannia Energy Ltd', columnIndex: 2 },
        'base currency': { value: 'GBP', columnIndex: 3 },
        'facility limit': { value: '600000', columnIndex: 4 },
        'facility utilisation': { value: '34538e.54', columnIndex: 5 },
        'total fees accrued for the month': { value: '367.23', columnIndex: 6 },
        'monthly fees paid to ukef': { value: '367.23', columnIndex: 7 },
        'payment reference': { value: 'Britannia Energy / 3001175147', columnIndex: 8 },
      };

      const { headerErrors } = validateCsvHeaders(csvDataRowWithMissingHeader);

      expect(headerErrors.length).toBe(1);
      expect(headerErrors[0].errorMessage).toBe('UKEF facility ID header is missing or spelt incorrectly');
    });

    it('returns no errors when no headers are missing', async () => {
      const csvDataRowWithCorrectHeaders = {
        'bank facility reference': { value: 'Britannia Energy GEF', columnIndex: 0 },
        'ukef facility id': { value: '20001371', columnIndex: 1 },
        exporter: { value: 'Britannia Energy Ltd', columnIndex: 2 },
        'base currency': { value: 'GBP', columnIndex: 3 },
        'facility limit': { value: '600000', columnIndex: 4 },
        'facility utilisation': { value: '34538e.54', columnIndex: 5 },
        'total fees accrued for the month': { value: '367.23', columnIndex: 6 },
        'monthly fees paid to ukef': { value: '367.23', columnIndex: 7 },
        'payment reference': { value: 'Britannia Energy / 3001175147', columnIndex: 8 },
      };

      const { headerErrors } = validateCsvHeaders(csvDataRowWithCorrectHeaders);

      expect(headerErrors.length).toBe(0);
    });

    it('returns multiple errors if multiple headers are missing', async () => {
      const csvDataRowWithIncorrectlySpeltFacilityIdAndCurrency = {
        'bank facility reference': { value: 'Britannia Energy GEF', columnIndex: 0 },
        'ukef facilitty id': { value: '20001371', columnIndex: 1 },
        exporter: { value: 'Britannia Energy Ltd', columnIndex: 2 },
        'base curency': { value: 'GBP', columnIndex: 3 },
        'facility limit': { value: '600000', columnIndex: 4 },
        'facility utilisation': { value: '34538e.54', columnIndex: 5 },
        'total fees accrued for the month': { value: '367.23', columnIndex: 6 },
        'monthly fees paid to ukef': { value: '367.23', columnIndex: 7 },
        'payment reference': { value: 'Britannia Energy / 3001175147', columnIndex: 8 },
      };

      const { headerErrors } = validateCsvHeaders(csvDataRowWithIncorrectlySpeltFacilityIdAndCurrency);

      expect(headerErrors.length).toBe(2);
      expect(headerErrors[0].errorMessage).toBe('UKEF facility ID header is missing or spelt incorrectly');
    });
  });

  describe('validateCsvData', () => {
    it('returns an error if a header is missing', async () => {
      const csvDataRowWithMissingHeader = {
        'bank facility reference': { value: 'Britannia Energy GEF', columnIndex: 0 },
        exporter: { value: 'Britannia Energy Ltd', columnIndex: 2 },
        'base currency': { value: 'GBP', columnIndex: 3 },
        'facility limit': { value: '600000', columnIndex: 4 },
        'facility utilisation': { value: '34538e.54', columnIndex: 5 },
        'total fees accrued for the month': { value: '367.23', columnIndex: 6 },
        'monthly fees paid to ukef': { value: '367.23', columnIndex: 7 },
        'payment reference': { value: 'Britannia Energy / 3001175147', columnIndex: 8 },
      };

      const { headerErrors } = validateCsvHeaders(csvDataRowWithMissingHeader);

      expect(headerErrors.length).toBe(1);
      expect(headerErrors[0].errorMessage).toBe('UKEF facility ID header is missing or spelt incorrectly');
    });
  });
});
