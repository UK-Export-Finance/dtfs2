import { getOneIndexedMonth } from './getOneIndexedMonth';

describe('getOneIndexedMonth', () => {
  let dates = [];
  for (let i = 0; i < 12; i += 1) {
    const newDate = new Date();
    newDate.setMonth(i);
    dates.push({ newDate, expectedOneIndexMonth: i + 1 });
  }

  it.each(dates)('should return numeric value incremented by 1', (date) => {
    const response = getOneIndexedMonth(date.newDate);
    expect(response).toEqual(date.expectedOneIndexMonth);
  });
});
