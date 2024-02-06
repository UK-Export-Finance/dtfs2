const { getReportPeriod } = require('./utilisation-report-status');

describe('utilisation-report-status', () => {
  describe('getCurrentReportPeriod', () => {
    const dates = [{
      lastDayOfMonth: new Date('2023-01-31'),
      previousMonth: 'December 2022',
      month: 12,
      year: 2022,
    }, {
      lastDayOfMonth: new Date('2023-02-28'),
      previousMonth: 'January 2023',
      month: 1,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-03-31'),
      previousMonth: 'February 2023',
      month: 2,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-04-30'),
      previousMonth: 'March 2023',
      month: 3,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-05-31'),
      previousMonth: 'April 2023',
      month: 4,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-06-30'),
      previousMonth: 'May 2023',
      month: 5,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-07-31'),
      previousMonth: 'June 2023',
      month: 6,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-08-31'),
      previousMonth: 'July 2023',
      month: 7,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-09-30'),
      previousMonth: 'August 2023',
      month: 8,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-10-31'),
      previousMonth: 'September 2023',
      month: 9,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-11-30'),
      previousMonth: 'October 2023',
      month: 10,
      year: 2023,
    }, {
      lastDayOfMonth: new Date('2023-12-31'),
      previousMonth: 'November 2023',
      month: 11,
      year: 2023,
    }];

    it.each(dates)('should return report period as a string and month and year as numbers', (date) => {
      jest.useFakeTimers().setSystemTime(date.lastDayOfMonth);
      const { reportPeriod, month, year } = getReportPeriod();

      expect(reportPeriod).toEqual(date.previousMonth);
      expect(month).toEqual(date.month);
      expect(year).toEqual(date.year);
    });
  });
});
