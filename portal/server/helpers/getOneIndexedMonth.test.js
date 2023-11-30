import { getOneIndexedMonth } from './getOneIndexedMonth';

describe('getOneIndexedMonth', () => {
  it.each([
    { date: new Date(2023, 0), expectedOneIndexMonth: 1 },
    { date: new Date(2023, 1), expectedOneIndexMonth: 2 },
    { date: new Date(2023, 2), expectedOneIndexMonth: 3 },
    { date: new Date(2023, 3), expectedOneIndexMonth: 4 },
    { date: new Date(2023, 4), expectedOneIndexMonth: 5 },
    { date: new Date(2023, 5), expectedOneIndexMonth: 6 },
    { date: new Date(2023, 6), expectedOneIndexMonth: 7 },
    { date: new Date(2023, 7), expectedOneIndexMonth: 8 },
    { date: new Date(2023, 8), expectedOneIndexMonth: 9 },
    { date: new Date(2023, 9), expectedOneIndexMonth: 10 },
    { date: new Date(2023, 10), expectedOneIndexMonth: 11 },
    { date: new Date(2023, 11), expectedOneIndexMonth: 12 },
  ])('should return $expectedOneIndexMonth when the date is', ({ date, expectedOneIndexMonth }) => {
    const response = getOneIndexedMonth(date);
    expect(response).toEqual(expectedOneIndexMonth);
  });
});
