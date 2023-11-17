import { addOneBusinessDayWithHolidays, getFirstBusinessDay, getBusinessDayByIndex } from './getBusinessDayByIndex';

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

describe('getFirstBusinessDay', () => {
  describe('when there are no holidays', () => {
    const mondayDate = new Date('2023-11-20');
    const sundayDate = new Date('2023-11-19');
    const holidays = [];

    it('should return Monday when Monday is passed in', () => {
      const date = mondayDate;

      const result = getFirstBusinessDay(date, holidays);

      expect(result).toEqual(mondayDate);
    });

    it('should return Monday when Sunday is passed in', () => {
      const date = sundayDate;

      const result = getFirstBusinessDay(date, holidays);

      expect(result).toEqual(mondayDate);
    });
  });

  describe('when Thursday and Friday are holidays', () => {
    const thursdayDate = new Date('2023-11-16');
    const fridayDate = new Date('2023-11-17');
    const mondayDate = new Date('2023-11-20');
    const holidays = [thursdayDate, fridayDate];

    it('should return Monday when Thursday is passed in', () => {
      const date = thursdayDate;

      const result = getFirstBusinessDay(date, holidays);

      expect(result).toEqual(mondayDate);
    });
  });
});

describe('getBusinessDayByIndex', () => {
  it('should throw an error when the index is less than 1', () => {
    const firstDay = new Date();
    const holidays = [];
    const index = 0;

    expect(() => getBusinessDayByIndex(firstDay, holidays, index)).toThrow(new Error('Error getting business day by index: index must be a positive number'));
  });

  it('should throw an error when the index is not a number', () => {
    const firstDay = new Date();
    const holidays = [];
    const index = 'first';

    expect(() => getBusinessDayByIndex(firstDay, holidays, index)).toThrow(new Error('Error getting business day by index: index must be a positive number'));
  });

  describe('when the first day is Tuesday and there are no holidays', () => {
    const firstDay = new Date(2023, 9, 24);
    const secondBusinessDay = new Date(2023, 9, 25);
    const holidays = [];

    it('should return the same day when the index is 1', () => {
      const index = 1;

      const result = getBusinessDayByIndex(firstDay, holidays, index);

      expect(result).toEqual(firstDay);
    });

    it('should return the next day when the index is 2', () => {
      const index = 2;

      const result = getBusinessDayByIndex(firstDay, holidays, index);

      expect(result).toEqual(secondBusinessDay);
    });
  });

  describe('when the first day is Tuesday and Wednesday is a holiday', () => {
    const firstDay = new Date(2023, 9, 24);
    const secondBusinessDay = new Date(2023, 9, 26);
    const holidays = [new Date(2023, 9, 25)];

    it('should return Thursday when the index is 2', () => {
      const index = 2;

      const result = getBusinessDayByIndex(firstDay, holidays, index);

      expect(result).toEqual(secondBusinessDay);
    });
  });

  describe('when the first day is Friday and there are no holidays', () => {
    const firstDay = new Date(2023, 9, 27);
    const secondBusinessDay = new Date(2023, 9, 30);
    const holidays = [];

    it('should return Monday when the index is 2', () => {
      const index = 2;

      const result = getBusinessDayByIndex(firstDay, holidays, index);

      expect(result).toEqual(secondBusinessDay);
    });
  });

  describe('when the first day is Sunday and there are no holidays', () => {
    const firstDay = new Date(2023, 9, 29);
    const firstBusinessDay = new Date(2023, 9, 30);
    const holidays = [];

    it('should return Monday when the index is 1', () => {
      const index = 1;

      const result = getBusinessDayByIndex(firstDay, holidays, index);

      expect(result).toEqual(firstBusinessDay);
    });
  });
});
