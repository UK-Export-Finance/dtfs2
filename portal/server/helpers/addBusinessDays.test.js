import { addBusinessDaysWithHolidays } from './addBusinessDays';

describe('addBusinessDaysWithHolidays', () => {
  const startingDateTuesday = new Date(2023, 9, 24);
  const startingDateFriday = new Date(2023, 9, 27);
  const oneDay = 1;
  const fiveDays = 5;
  const noHolidays = [];
  const holidays = [
    new Date(2023, 9, 25),
    new Date(2023, 9, 27),
  ];

  it('should return following day when 1 day added to Tuesday with no holidays', () => {
    const response = addBusinessDaysWithHolidays(startingDateTuesday, oneDay, noHolidays);

    expect(response).toEqual(new Date(2023, 9, 25));
  });

  it('should return following Monday when 1 day added to Friday with no holidays', () => {
    const response = addBusinessDaysWithHolidays(startingDateFriday, oneDay, noHolidays);

    expect(response).toEqual(new Date(2023, 9, 30));
  });

  it('should return following Tuesday when 5 days added to Tuesday with no holidays', () => {
    const response = addBusinessDaysWithHolidays(startingDateTuesday, fiveDays, noHolidays);

    expect(response).toEqual(new Date(2023, 9, 31));
  });

  it('should return Thursday when 1 day to Tuesday added with 1 holiday', () => {
    const response = addBusinessDaysWithHolidays(startingDateTuesday, oneDay, holidays);

    expect(response).toEqual(new Date(2023, 9, 26));
  });

  it('should return following Thursday when 5 days added to Tuesday with 2 holidays', () => {
    const response = addBusinessDaysWithHolidays(startingDateTuesday, fiveDays, holidays);

    expect(response).toEqual(new Date(2023, 10, 2));
  });
});
