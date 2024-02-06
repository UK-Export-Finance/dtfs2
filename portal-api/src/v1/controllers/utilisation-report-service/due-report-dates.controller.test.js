const { isSameMonth } = require('date-fns');
const { isCurrentReportSubmitted, getNextDueReportDate, getDueReportDatesList } = require('./due-report-dates.controller');

beforeAll(() => {
  const mockDate = new Date('2023-03-01');
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('controllers/utilisation-report-service/due-report-dates', () => {
  const mockBank = {
    id: '9',
    name: 'TEST_BANK',
  };
  const mockUser = {
    id: '1',
    name: 'Jack Daniels',
  };
  const upToDateReports = [{
    bank: mockBank,
    reportPeriod: {
        start: {
          month: 11,
          year: 2022,
        },
        end: {
          month: 11,
          year: 2022,
        },
      },
    dateUploaded: '2022-11-01T00:00',
    uploadedBy: mockUser,
    path: 'www.abc.com',
  }, {
    bank: mockBank,
    reportPeriod: {
        start: {
          month: 12,
          year: 2022,
        },
        end: {
          month: 12,
          year: 2022,
        },
      },
    dateUploaded: '2022-12-01T00:00',
    uploadedBy: mockUser,
    path: 'www.abc.com',
  }, {
    bank: mockBank,
    reportPeriod: {
        start: {
          month: 1,
          year: 2023,
        },
        end: {
          month: 1,
          year: 2023,
        },
      },
    dateUploaded: '2023-01-01T00:00',
    uploadedBy: mockUser,
    path: 'www.abc.com',
  }, {
    bank: mockBank,
    reportPeriod: {
        start: {
          month: 2,
          year: 2023,
        },
        end: {
          month: 2,
          year: 2023,
        },
      },
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
      const januaryReport = upToDateReports.find(({ reportPeriod }) => reportPeriod.start.month === 1);
      const result = isCurrentReportSubmitted(januaryReport, currentDueReportDate);

      expect(result).toBe(false);
    });

    it('should return true if the supplied report does match the current due report date', () => {
      const februaryReport = upToDateReports.find(({ reportPeriod }) => reportPeriod.start.month === 2);
      const result = isCurrentReportSubmitted(februaryReport, currentDueReportDate);

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
      const decemberReport = upToDateReports.find(({ reportPeriod }) => reportPeriod.start.month === 12);
      const result = getNextDueReportDate(decemberReport, currentDueReportDate);
      const januaryReportDueDate = new Date('2023-01-01');

      expect(isSameMonth(result, januaryReportDueDate)).toBe(true);
    });
  });

  describe('getDueReportDatesList', () => {
    it('should return the current reporting period if the input is undefined', () => {
      const expectedDueReportDate = [dueReportDatesFromDecember2022.at(-1)];
      const undefinedDueReportDates = getDueReportDatesList(undefined);

      expect(undefinedDueReportDates).toEqual(expectedDueReportDate);
    });

    it('should return an empty array if the most recent report is in the current reporting period', () => {
      const latestReport = upToDateReports.at(-1);
      const result = getDueReportDatesList(latestReport);

      expect(result).toEqual([]);
    });

    it('should return the expected due report dates when passed an outdated report', () => {
      const novemberReport = upToDateReports.find(({ reportPeriod }) => reportPeriod.start.month === 11);
      const dueReportDates = getDueReportDatesList(novemberReport);

      expect(dueReportDates).toEqual(dueReportDatesFromDecember2022);
    });
  });
});
