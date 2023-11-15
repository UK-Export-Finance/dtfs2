const { addBusinessDaysWithHolidays, getMonthName } = require('./date');

describe('date', () => {
  describe('addBusinessDaysWithHolidays', () => {
    const weekOneMonday = new Date('2023-10-30');
    const weekOneTuesday = new Date('2023-10-31');
    const weekOneWednesday = new Date('2023-11-01');
    const weekOneThursday = new Date('2023-11-02');
    const weekOneFriday = new Date('2023-11-03');
    const weekTwoMonday = new Date('2023-11-06');
    const weekTwoTuesday = new Date('2023-11-07');

    it.each([
      {
        testCase: 'adding one day, no weekends or holidays',
        fromDate: weekOneWednesday,
        days: 1,
        holidays: [],
        expectedDate: weekOneThursday,
      },
      {
        testCase: 'adding two days, no weekends or holidays',
        fromDate: weekOneWednesday,
        days: 2,
        holidays: [],
        expectedDate: weekOneFriday,
      },
      {
        testCase: 'adding three days, over weekend but no holidays',
        fromDate: weekOneWednesday,
        days: 3,
        holidays: [],
        expectedDate: weekTwoMonday,
      },
      {
        testCase: 'adding one day, no weekends or relevant holidays',
        fromDate: weekOneWednesday,
        days: 1,
        holidays: [weekOneFriday],
        expectedDate: weekOneThursday,
      },
      {
        testCase: 'adding one day, no weekends but one relevant holiday',
        fromDate: weekOneWednesday,
        days: 1,
        holidays: [weekOneThursday],
        expectedDate: weekOneFriday,
      },
      {
        testCase: 'adding one day, no weekends but two relevant consecutive holidays',
        fromDate: weekOneTuesday,
        days: 1,
        holidays: [weekOneWednesday, weekOneThursday],
        expectedDate: weekOneFriday,
      },
      {
        testCase: 'adding one day, weekends and relevant holidays',
        fromDate: weekOneWednesday,
        days: 1,
        holidays: [weekOneThursday, weekOneFriday],
        expectedDate: weekTwoMonday,
      },
      {
        testCase: 'adding two days, no weekends or relevant holidays',
        fromDate: weekOneWednesday,
        days: 2,
        holidays: [weekTwoMonday],
        expectedDate: weekOneFriday,
      },
      {
        testCase: 'adding two days, no weekends but one relevant holiday',
        fromDate: weekOneTuesday,
        days: 2,
        holidays: [weekOneThursday],
        expectedDate: weekOneFriday,
      },
      {
        testCase: 'adding two days, no weekends but two relevant consecutive holidays',
        fromDate: weekOneMonday,
        days: 2,
        holidays: [weekOneTuesday, weekOneWednesday],
        expectedDate: weekOneFriday,
      },
      {
        testCase: 'adding two days, weekends and relevant consecutive holidays',
        fromDate: weekOneWednesday,
        days: 2,
        holidays: [weekOneThursday, weekOneFriday],
        expectedDate: weekTwoTuesday,
      },
      {
        testCase: 'adding two days, weekends and relevant non-consecutive holidays',
        fromDate: weekOneWednesday,
        days: 2,
        holidays: [weekOneThursday, weekTwoMonday],
        expectedDate: weekTwoTuesday,
      },
    ])('returns the correct date when $testCase', ({ fromDate, days, holidays, expectedDate }) => {
      // Act
      const date = addBusinessDaysWithHolidays(fromDate, days, holidays);

      // Assert
      expect(date).toEqual(expectedDate);
    });
  });

  describe('getMonthName', () => {
    it.each([
      { monthNumber: 1, expectedMonthName: 'January' },
      { monthNumber: 2, expectedMonthName: 'February' },
      { monthNumber: 3, expectedMonthName: 'March' },
      { monthNumber: 4, expectedMonthName: 'April' },
      { monthNumber: 5, expectedMonthName: 'May' },
      { monthNumber: 6, expectedMonthName: 'June' },
      { monthNumber: 7, expectedMonthName: 'July' },
      { monthNumber: 8, expectedMonthName: 'August' },
      { monthNumber: 9, expectedMonthName: 'September' },
      { monthNumber: 10, expectedMonthName: 'October' },
      { monthNumber: 11, expectedMonthName: 'November' },
      { monthNumber: 12, expectedMonthName: 'December' },
    ])("returns month name '$expectedMonthName' from month number '$monthNumber'", ({ monthNumber, expectedMonthName }) => {
      // Act
      const monthName = getMonthName(monthNumber);

      // Assert
      expect(monthName).toEqual(expectedMonthName);
    });
  });
});
