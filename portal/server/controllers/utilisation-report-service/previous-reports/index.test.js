import { getMonthName } from './index';

describe('controllers/utilisation-report-service/previous-reports', () => {
  it.each([
    {
      monthNumber: 1,
      monthName: 'January',
    },
    {
      monthNumber: 2,
      monthName: 'February',
    },
    {
      monthNumber: 3,
      monthName: 'March',
    },
    {
      monthNumber: 4,
      monthName: 'April',
    },
    {
      monthNumber: 5,
      monthName: 'May',
    },
    {
      monthNumber: 6,
      monthName: 'June',
    },
    {
      monthNumber: 7,
      monthName: 'July',
    },
    {
      monthNumber: 8,
      monthName: 'August',
    },
    {
      monthNumber: 9,
      monthName: 'September',
    },
    {
      monthNumber: 10,
      monthName: 'October',
    },
    {
      monthNumber: 11,
      monthName: 'November',
    },
    {
      monthNumber: 12,
      monthName: 'December',
    },
  ])('should return month name from month number', (value) => {
    const monthName = getMonthName(value.monthNumber);

    expect(monthName).toEqual(value.monthName);
  });
});
