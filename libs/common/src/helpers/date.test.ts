import { format } from 'date-fns';
import { getOneIndexedMonth } from './date';

describe('date helpers', () => {
  describe('getOneIndexedMonth', () => {
    const zeroIndexedMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const datesWithOneIndexedMonths = zeroIndexedMonths.map((zeroIndexedMonth) => {
      const dateInMonth = new Date(2024, zeroIndexedMonth);
      const formattedMonth = format(dateInMonth, 'MMMM');
      const expectedOneIndexedMonth = zeroIndexedMonth + 1;
      return { dateInMonth, formattedMonth, expectedOneIndexedMonth };
    });

    it.each(datesWithOneIndexedMonths)('returns $expectedOneIndexedMonth when the month is $formattedMonth', ({ dateInMonth, expectedOneIndexedMonth }) => {
      // Act
      const oneIndexedMonth = getOneIndexedMonth(dateInMonth);

      // Assert
      expect(oneIndexedMonth).toBe(expectedOneIndexedMonth);
    });
  });
});
