/**
 * ISO 8601 date time string in format 'yyyy-MM-ddThh:mm:ssZ'
 */
export type IsoDateTimeStamp = string;

export type OneIndexedMonth = number;

export type MonthAndYear = {
  month: OneIndexedMonth;
  year: number;
};
