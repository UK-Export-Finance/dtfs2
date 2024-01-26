export interface BankHolidaysEvent {
  title: string;
  date: string;
  notes: string;
  bunting: boolean;
}

interface BankHolidaysDivision {
  division: string;
  events: BankHolidaysEvent[];
}

export interface BankHolidays {
  'england-and-wales': BankHolidaysDivision;
  scotland: BankHolidaysDivision;
  'northern-ireland': BankHolidaysDivision;
}
