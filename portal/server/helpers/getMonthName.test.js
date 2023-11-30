const { getMonthName } = require('./getMonthName');

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
