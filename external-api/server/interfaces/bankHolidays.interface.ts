export type BankHolidaysEvent = {
  title: string;
  date: string;
  notes: string;
  bunting: boolean;
};

type BankHolidaysDivision = {
  division: string;
  events: BankHolidaysEvent[];
};

export type BankHolidays = {
  'england-and-wales': BankHolidaysDivision;
  scotland: BankHolidaysDivision;
  'northern-ireland': BankHolidaysDivision;
};
