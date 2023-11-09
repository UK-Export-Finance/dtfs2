const { getDueReportDates } = require('./due-reports.controller');

beforeAll(() => {
  const mockDate = new Date(2023, 2, 1); // Mar 1st 2023
  jest.useFakeTimers('modern');
  jest.setSystemTime(mockDate);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('controllers/utilisation-report-service/due-reports', () => {
  const mockBack = {
    id: '9',
    name: 'TEST_BANK',
  };
  const mockUser = {
    id: '1',
    name: 'Jack Daniels',
  };
  const upToDateReports = [{
    bank: mockBack,
    month: 11,
    year: 2022,
    dateUploaded: '2022-11-01T00:00',
    uploadedBy: mockUser,
    path: 'www.abc.com',
  }, {
    bank: mockBack,
    month: 12,
    year: 2022,
    dateUploaded: '2022-12-01T00:00',
    uploadedBy: mockUser,
    path: 'www.abc.com',
  }, {
    bank: mockBack,
    month: 1,
    year: 2023,
    dateUploaded: '2023-01-01T00:00',
    uploadedBy: mockUser,
    path: 'www.abc.com',
  }, {
    bank: mockBack,
    month: 2,
    year: 2023,
    dateUploaded: '2023-02-01T00:00',
    uploadedBy: mockUser,
    path: 'www.abc.com',
  }];
  const dueReportDatesFromDecember2022 = [{
    year: 2022,
    month: 12,
  }, {
    year: 2023,
    month: 1,
  }, {
    year: 2023,
    month: 2,
  }];

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
