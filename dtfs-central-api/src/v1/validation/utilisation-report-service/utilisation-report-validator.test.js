const {
  validateMonth, validateYear, validateReportPeriod, validateFileInfo, validateUtilisationReportData
} = require('./utilisation-report-validator');

describe('utilisation-report-validator', () => {
  describe('validateMonth', () => {
    it('returns null when a correct month is provided', async () => {
      const validationError = validateMonth(1, 'Month');

      expect(validationError).toEqual(null);
    });

    it('returns an error when no month is provided', async () => {
      const validationError = validateMonth(undefined, 'Month');

      expect(validationError).toEqual('Month is required');
    });

    it('returns an error when an incorrect month is provided', async () => {
      const validationError = validateMonth(14, 'Month');

      expect(validationError).toEqual('Month must be between 1 and 12');
    });
  });

  describe('validateYear', () => {
    it('returns null when a correct year is provided', async () => {
      const validationError = validateYear(2023, 'Year');

      expect(validationError).toEqual(null);
    });

    it('returns an error when no year is provided', async () => {
      const validationError = validateYear(undefined, 'Year');

      expect(validationError).toEqual('Year is required');
    });

    it('returns an error when an incorrect year is provided', async () => {
      const validationError = validateYear(1990, 'Year');

      expect(validationError).toEqual('Year must be between 2020 and 2100');
    });
  });

  describe('validateReportPeriod', () => {
    it('returns an empty array when correct report period is provided', async () => {
      const validationErrors = validateReportPeriod({
        start: {
          month: 1,
          year: 2021,
        },
        end: {
          month: 1,
          year: 2021,
        },
      });

      expect(validationErrors).toEqual([]);
    });

    it('returns an error when no report period is provided', async () => {
      const validationErrors = validateReportPeriod(undefined);

      expect(validationErrors).toEqual(['Report period is required']);
    });

    it('returns an error if the report period properties are not numbers in the correct range', async () => {
      const validationErrors = validateReportPeriod({
        start: {
          month: {},
          year: '1999',
        },
        end: {
          month: true,
          year: 'x',
        },
      });

      expect(validationErrors.length).toBe(4);
      expect(validationErrors).toContain('startMonth must be between 1 and 12');
      expect(validationErrors).toContain('startYear must be between 2020 and 2100');
      expect(validationErrors).toContain('endMonth must be between 1 and 12');
      expect(validationErrors).toContain('endYear must be between 2020 and 2100');
    });

    it('returns an error if a report period start and end properties are not provided', async () => {
      const validationErrors = validateReportPeriod({ start: {}, end: {}});

      expect(validationErrors.length).toBe(4);
      expect(validationErrors).toContain('startMonth is required');
      expect(validationErrors).toContain('startYear is required');
      expect(validationErrors).toContain('endMonth is required');
      expect(validationErrors).toContain('endYear is required');
    });
  });

  describe('validateFileInfo', () => {
    it('returns an empty array when correct file info is provided', async () => {
      const validationErrors = validateFileInfo({
        folder: 'test_bank',
        filename: '2021_January_test_bank_utilisation_report.csv',
        fullPath: 'test_bank/2021_January_test_bank_utilisation_report.csv',
        url: 'test.url.csv',
        mimetype: 'text/csv',
      });

      expect(validationErrors).toEqual([]);
    });

    it('returns an error when no file info is provided', async () => {
      const validationErrors = validateFileInfo(undefined);

      expect(validationErrors).toEqual(['File info is required']);
    });

    it('returns an error if the file info properties are not strings', async () => {
      const validationErrors = validateFileInfo({
        folder: 14,
        filename: {},
        fullPath: true,
        url: {},
        mimetype: 1,
      });

      expect(validationErrors.length).toBe(5);
      expect(validationErrors).toContain('Folder name from file info must be a string');
      expect(validationErrors).toContain('Filename from file info must be a string');
      expect(validationErrors).toContain('Full path from file info must be a string');
      expect(validationErrors).toContain('Url from file info must be a string');
      expect(validationErrors).toContain('Mimetype from file info must be a string');
    });

    it('returns an error if a file info property is not provided', async () => {
      const validationErrors = validateFileInfo({});

      expect(validationErrors.length).toBe(5);
      expect(validationErrors).toContain('Folder name from file info is required');
      expect(validationErrors).toContain('Filename from file info is required');
      expect(validationErrors).toContain('Full path from file info is required');
      expect(validationErrors).toContain('Url from file info is required');
      expect(validationErrors).toContain('Mimetype from file info is required');
    });
  });

  describe('validateUtilisationReportData', () => {
    it('returns an empty array when no errors are found', async () => {
      const validCsvData = [
        {
          'ukef facility id': '24738147',
          'facility utilisation': 100000,
        },
        {
          'ukef facility id': '27483617',
          'facility utilisation': 200000,
        },
      ];
      const validationError = validateUtilisationReportData(validCsvData);

      expect(validationError).toEqual([]);
    });

    it('returns an array of errors if the report has any errors', async () => {
      const invalidCsvData = [
        {
          'ukef facility id': 'abc',
          'facility utilisation': 100000,
        },
        {
          'ukef facility id': '27483617',
          'facility utilisation': {},
        },
      ];
      const validationError = validateUtilisationReportData(invalidCsvData);

      expect(validationError.length).toBeGreaterThan(0);
    });
  });
});
