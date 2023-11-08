const { getMostRecentReport, getDueReportDates } = require('./due-reports.controller');

beforeAll(() => {
  const mockDate = new Date(2023, 2, 1); // Mar 1st 2023
  jest.useFakeTimers('modern');
  jest.setSystemTime(mockDate);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('controllers/utilisation-report-service/due-reports', () => {
  const upToDateReports = [{
    bankId: '9',
    month: 11,
    year: 2022,
    dateUploaded: '2022-11-01T00:00',
    uploadedById: '1',
    path: 'www.abc.com',
  }, {
    bankId: '9',
    month: 12,
    year: 2022,
    dateUploaded: '2022-12-01T00:00',
    uploadedById: '1',
    path: 'www.abc.com',
  }, {
    bankId: '9',
    month: 1,
    year: 2023,
    dateUploaded: '2023-01-01T00:00',
    uploadedById: '1',
    path: 'www.abc.com',
  }, {
    bankId: '9',
    month: 2,
    year: 2023,
    dateUploaded: '2023-02-01T00:00',
    uploadedById: '1',
    path: 'www.abc.com',
  }];
  const dueReportDatesFromDecember2022 = [{
    year: 2022,
    month: 'December',
  }, {
    year: 2023,
    month: 'January',
  }, {
    year: 2023,
    month: 'February',
  }];

  describe('getMostRecentReport', () => {
    it('should return null if input reports are null or undefined', () => {
      const nullResult = getMostRecentReport(null);
      const undefinedResult = getMostRecentReport(undefined);

      expect(nullResult).toBeNull();
      expect(undefinedResult).toBeNull();
    });

    it('should return null if input reports are empty', () => {
      const result = getMostRecentReport([]);

      expect(result).toBeNull();
    });

    it('should return the most recent report', () => {
      const expectedMostRecentReport = upToDateReports.at(-1);
      const mostRecentReport = getMostRecentReport(upToDateReports);

      expect(mostRecentReport).toEqual(expectedMostRecentReport);
    });
  });

  describe('getDueReportDates', () => {
    it('should return the current reporting period if the input is null or undefined', () => {
      const expectedDueReportDate = [dueReportDatesFromDecember2022.at(-1)];
      const nullDueReportDates = getDueReportDates(null);
      const undefinedDueReportDates = getDueReportDates(undefined);

      expect(nullDueReportDates).toEqual(expectedDueReportDate);
      expect(undefinedDueReportDates).toEqual(expectedDueReportDate);
    });

    it('should return an empty array if the most recent report is in the current reporting period', () => {
      const mostRecentReport = upToDateReports.at(-1);
      const result = getDueReportDates(mostRecentReport);

      expect(result).toEqual([]);
    });

    it('should return the expected due report dates when passed an outdated report', () => {
      const reportFromNovember = upToDateReports[0];
      const dueReportDates = getDueReportDates(reportFromNovember);

      expect(dueReportDates).toEqual(dueReportDatesFromDecember2022);
    });
  });
});
