const { getCurrentReportPeriod } = require('./utilisation-report-status');

describe('utilisation-report-status', () => {
  describe('getCurrentReportPeriod', () => {
    const dates = [{
      firstDayOfMonth: new Date(2023, 0, 1),
      previousMonth: 'December 2022',
    }, {
      firstDayOfMonth: new Date(2023, 1, 1),
      previousMonth: 'January 2023',
    }, {
      firstDayOfMonth: new Date(2023, 2, 1),
      previousMonth: 'February 2023',
    }, {
      firstDayOfMonth: new Date(2023, 3, 1),
      previousMonth: 'March 2023',
    }, {
      firstDayOfMonth: new Date(2023, 4, 1),
      previousMonth: 'April 2023',
    }, {
      firstDayOfMonth: new Date(2023, 5, 1),
      previousMonth: 'May 2023',
    }, {
      firstDayOfMonth: new Date(2023, 6, 1),
      previousMonth: 'June 2023',
    }, {
      firstDayOfMonth: new Date(2023, 7, 1),
      previousMonth: 'July 2023',
    }, {
      firstDayOfMonth: new Date(2023, 8, 1),
      previousMonth: 'August 2023',
    }, {
      firstDayOfMonth: new Date(2023, 9, 1),
      previousMonth: 'September 2023',
    }, {
      firstDayOfMonth: new Date(2023, 10, 1),
      previousMonth: 'October 2023',
    }, {
      firstDayOfMonth: new Date(2023, 11, 1),
      previousMonth: 'November 2023',
    }];

    it.each(dates)('should return previous month as a string', (date) => {
      const result = getCurrentReportPeriod(date.firstDayOfMonth);

      expect(result).toEqual(date.previousMonth);
    });
  });
});
