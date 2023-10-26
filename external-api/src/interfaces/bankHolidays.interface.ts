interface Event {
  title: string;
  date: string;
  notes: string;
  bunting: boolean;
}

interface BankHolidaysDivision {
  division: string;
  events: Event[];
}

export interface BankHolidays {
  'england-and-wales': BankHolidaysDivision;
  scotland: BankHolidaysDivision;
  'northern-ireland': BankHolidaysDivision;
}
