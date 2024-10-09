const { isSameDay } = require('date-fns');
const { addOneBusinessDayWithHolidays, getFirstBusinessDayOfMonth, getBusinessDayOfMonth, getMonthName } = require('./date');

describe('date', () => {
  describe('addOneBusinessDayWithHolidays', () => {
    describe('when there are no holidays', () => {
      const mondayDate = new Date('2023-11-20');
      const tuesdayDate = new Date('2023-11-21');
      const fridayDate = new Date('2023-11-17');
      const holidays = [];

      it('should return tuesday when Monday is passed in', () => {
        const date = mondayDate;

        const result = addOneBusinessDayWithHolidays(date, holidays);

        expect(result).toEqual(tuesdayDate);
      });

      it('should return the following Monday when Friday is passed in', () => {
        const date = fridayDate;

        const result = addOneBusinessDayWithHolidays(date, holidays);

        expect(result).toEqual(mondayDate);
      });
    });

    describe('when Tuesday is a holiday', () => {
      const mondayDate = new Date('2023-11-20');
      const tuesdayDate = new Date('2023-11-21');
      const wednesdayDate = new Date('2023-11-22');
      const holidays = [tuesdayDate];

      it('should return Wednesday when Monday is passed in', () => {
        const date = mondayDate;

        const result = addOneBusinessDayWithHolidays(date, holidays);

        expect(result).toEqual(wednesdayDate);
      });
    });
  });

  describe('getFirstBusinessDayOfMonth', () => {
    describe('when the year is 2023 and there are no holidays', () => {
      const holidays = [];

      it('should return Wednesday 1st November when the month is November', () => {
        const dateInMonth = new Date('2023-11-10');

        const result = getFirstBusinessDayOfMonth(dateInMonth, holidays);

        const firstBusinessDay = new Date('2023-11-01');
        expect(isSameDay(result, firstBusinessDay)).toEqual(true);
      });

      it('should return Monday 2nd October when the month is October', () => {
        const dateInMonth = new Date('2023-10-14');

        const result = getFirstBusinessDayOfMonth(dateInMonth, holidays);

        const firstBusinessDay = new Date('2023-10-02');
        expect(isSameDay(result, firstBusinessDay)).toEqual(true);
      });
    });

    describe('when the year is 2023 and the first business day of October is a holiday', () => {
      const firstOctoberBusinessDay = new Date('2023-10-02');
      const holidays = [firstOctoberBusinessDay];

      it('should return Monday when Thursday is passed in', () => {
        const dateInMonth = new Date('2023-10-10');

        const result = getFirstBusinessDayOfMonth(dateInMonth, holidays);

        const firstBusinessDay = new Date('2023-10-03');
        expect(isSameDay(result, firstBusinessDay)).toEqual(true);
      });
    });
  });

  describe('getBusinessDayOfMonth', () => {
    it('should throw an error when businessDay is less than 1', () => {
      const dateInMonth = new Date('2023-01-01');
      const holidays = [];
      const businessDay = 0;

      expect(() => getBusinessDayOfMonth(dateInMonth, holidays, businessDay)).toThrow(
        new Error('Error getting business day: business day must be a positive number'),
      );
    });

    it('should throw an error when businessDay is not a number', () => {
      const dateInMonth = new Date('2023-01-01');
      const holidays = [];
      const businessDay = 'first';

      expect(() => getBusinessDayOfMonth(dateInMonth, holidays, businessDay)).toThrow(
        new Error('Error getting business day: business day must be a positive number'),
      );
    });

    describe('when the month is November 2023 and there are no holidays', () => {
      const dateInMonth = new Date('2023-11-01');
      const holidays = [];

      it('should return the same day as the first business day', () => {
        const businessDay = 1;

        const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

        const firstBusinessDay = new Date('2023-11-01');
        expect(isSameDay(result, firstBusinessDay)).toEqual(true);
      });

      it('should return the same day next week as the sixth business day', () => {
        const businessDay = 6;

        const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

        const sixthBusinessDay = new Date('2023-11-08');
        expect(isSameDay(result, sixthBusinessDay)).toEqual(true);
      });
    });

    describe('when the month is October 2023 and there are holidays', () => {
      const dateInMonth = new Date('2023-10-01');
      const holidays = [2, 3, 4, 6].map((day) => new Date(`2023-10-${day}`));

      it('should return 5th October as the first business day', () => {
        const businessDay = 1;

        const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

        const firstBusinessDay = new Date('2023-10-05');
        expect(isSameDay(result, firstBusinessDay)).toEqual(true);
      });

      it('should return 9th October as the second business day', () => {
        const businessDay = 2;

        const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

        const secondBusinessDay = new Date('2023-10-09');
        expect(isSameDay(result, secondBusinessDay)).toEqual(true);
      });
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
