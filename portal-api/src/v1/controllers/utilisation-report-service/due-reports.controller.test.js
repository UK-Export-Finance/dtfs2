const { isSameMonth } = require('date-fns');
const { isCurrentReportSubmitted, getNextDueReportDate, getDueReportDates } = require('./due-reports.controller');

beforeAll(() => {
  const mockDate = new Date('2023-03-01');
  jest.useFakeTimers();
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
  const currentDueReportDate = new Date('2023-02-01');

  describe('isCurrentReportSubmitted', () => {
    it('should return false if the supplied most recent report is undefined', () => {
      const emptyReport = undefined;
      const result = isCurrentReportSubmitted(emptyReport, currentDueReportDate);

      expect(result).toBe(false);
    });

    it('should return false if the supplied report does not match the current due report date', () => {
      const januaryReport = upToDateReports.find(({ month }) => month === 1);
      const result = isCurrentReportSubmitted(januaryReport, currentDueReportDate);

      expect(result).toBe(false);
    });

    it('should return true if the supplied report does match the current due report date', () => {
      const feburaryReport = upToDateReports.find(({ month }) => month === 2);
      const result = isCurrentReportSubmitted(feburaryReport, currentDueReportDate);

      expect(result).toBe(true);
    });
  });

  describe('getNextDueReportDate', () => {
    it('should return the current report period due date object if the supplied report is undefined', () => {
      const emptyReport = undefined;
      const result = getNextDueReportDate(emptyReport, currentDueReportDate);

      expect(isSameMonth(result, currentDueReportDate)).toBe(true);
    });

    it('should return the month following the most recent report if the supplied report is populated', () => {
      const decemberReport = upToDateReports.find(({ month }) => month === 12);
      const result = getNextDueReportDate(decemberReport, currentDueReportDate);
      const januaryReportDueDate = new Date('2023-01-01');

      expect(isSameMonth(result, januaryReportDueDate)).toBe(true);
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
      const novemberReport = upToDateReports.find(({ month }) => month === 11);
      const dueReportDates = getDueReportDates(novemberReport);

      expect(dueReportDates).toEqual(dueReportDatesFromDecember2022);
    });
  });
});
