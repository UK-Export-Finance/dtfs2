const { validateMonth, validateYear, validateFilePath, validateUtilisationReportData } = require('./utilisation-report-validator');

describe('utilisation-report-validator', () => {
  describe('validateMonth', () => {
    it('returns null when a correct month is provided', async () => {
      const validationError = validateMonth(1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when no month is provided', async () => {
      const validationError = validateMonth(undefined);

      expect(validationError).toEqual('Month is required');
    });

    it('returns null when an incorrect month is provided', async () => {
      const validationError = validateMonth(14);

      expect(validationError).toEqual('Month must be between 1 and 12');
    });
  });

  describe('validateYear', () => {
    it('returns null when a correct year is provided', async () => {
      const validationError = validateYear(2023);

      expect(validationError).toEqual(null);
    });

    it('returns an error when no year is provided', async () => {
      const validationError = validateYear(undefined);

      expect(validationError).toEqual('Year is required');
    });

    it('returns null when an incorrect year is provided', async () => {
      const validationError = validateYear(1990);

      expect(validationError).toEqual('Year must be between 2020 and 2100');
    });
  });

  describe('validateFilePath', () => {
    it('returns null when a correct file path is provided', async () => {
      const validationError = validateFilePath('/a/file/path');

      expect(validationError).toEqual(null);
    });

    it('returns an error when no file path is provided', async () => {
      const validationError = validateFilePath(undefined);

      expect(validationError).toEqual('File path is required');
    });

    it('returns null when an incorrect file path is provided', async () => {
      const validationError = validateFilePath(14);

      expect(validationError).toEqual('File path must be a string');
    });
  });

  describe('validateUtilisationReportData', () => {
    it('returns an empty array when no errors are found', async () => {
      const validCsvData = [
        {
          'ukef facility id': { value: '24738147' },
          'facility utilisation': { value: 100000 },
        },
        {
          'ukef facility id': { value: '27483617' },
          'facility utilisation': { value: 200000 },
        },
      ];
      const validationError = validateUtilisationReportData(validCsvData);

      expect(validationError).toEqual([]);
    });

    it('returns an array of errors if the report has any errors', async () => {
      const invalidCsvData = [
        {
          'ukef facility id': { value: 'abc' },
          'facility utilisation': { value: 100000 },
        },
        {
          'ukef facility id': { value: '27483617' },
          'facility utilisation': { value: {} },
        },
      ];
      const validationError = validateUtilisationReportData(invalidCsvData);

      expect(validationError.length).toBeGreaterThan(0);
    });
  });
});
