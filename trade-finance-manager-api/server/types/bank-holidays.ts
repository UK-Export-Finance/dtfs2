export type BankHolidayRegion = 'england-and-wales' | 'scotland' | 'northern-ireland';

type BankHolidayEvent = {
  /*
   * Title of the event - e.g. 'New Year's Day'
   */
  title: string;
  /*
   * Date of the event ISO 8601 format - e.g. '2022-01-03'
   */
  date: string;
  /*
   * Additional notes about the event - e.g. 'Substitute day'
   */
  notes: string;
  /*
   * Indicates whether the bank holiday is a suitable occasion for hanging bunting
   */
  bunting: boolean;
};

type BankHolidayRegionEvents = {
  division: BankHolidayRegion;
  events: BankHolidayEvent[];
};

export type BankHolidaysResponseBody = Record<BankHolidayRegion, BankHolidayRegionEvents>;
