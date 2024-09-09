export const DATE_FORMAT = {
  DAY_SHORT_MONTH_YEAR: 'd MMM yyyy',
  /**
   * The format used to get the date and month and year at a time using "am" or "pm"
   * as described by {@link https://stackoverflow.com/questions/60728212/how-do-you-format-a-datetime-to-am-pm-without-periods-when-using-date-fns-vers}
   * @example 1 Jan 2024 at 12:30pm
   */
  DAY_SHORT_MONTH_YEAR_AT_TIME: "d MMM yyyy 'at' hh:mmaaaaa'm'",
} as const;
