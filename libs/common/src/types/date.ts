import z from 'zod';
import { UNIX_TIMESTAMP_MILLISECONDS_SCHEMA, UNIX_TIMESTAMP_SCHEMA, UNIX_TIMESTAMP_SECONDS_SCHEMA } from '../schemas';

/**
 * @deprecated Prefer either UnixTimestampMilliseconds or UnixTimestampSeconds depending on the unit,
 * this type is kept to document existing timestamps that are in an unknown unit
 *
 * Unix timestamp, representing the time that has elapsed since 1st January 1970
 * (UTC).
 *
 * e.g. A Unix timestamp of 1702900314 is equivalent to an ISO 8601 date time
 * stamp of '2023-12-18T11:51:54Z'
 *
 * The timestamps can be of varying lengths depending on the precision:
 *  * 10 digits - seconds
 *  * 13 digits - milliseconds
 *  * 16 digits - microseconds
 *  * 19 digits - nanoseconds
 */
export type UnixTimestamp = z.infer<typeof UNIX_TIMESTAMP_SCHEMA>;

export type UnixTimestampMilliseconds = z.infer<typeof UNIX_TIMESTAMP_MILLISECONDS_SCHEMA>;
/**
 * Unix timestamp, representing the seconds that have elapsed since 1st January 1970
 * (UTC).
 *
 * e.g. A Unix timestamp of 1702900314 is equivalent to an ISO 8601 date time
 * stamp of '2023-12-18T11:51:54Z'
 *
 */
export type UnixTimestampSeconds = z.infer<typeof UNIX_TIMESTAMP_SECONDS_SCHEMA>;

/**
 * ISO 8601 date time string in format 'yyyy-MM-ddThh:mm:ssZ'
 */
export type IsoDateTimeStamp = string;

export type OneIndexedMonth = number;

export type MonthAndYear = {
  month: OneIndexedMonth;
  year: number;
};

/**
 * ISO 8601 month string in format 'yyyy-MM'
 */
export type IsoMonthStamp = string;

/**
 * Unix timestamp, representing the time that has elapsed since 1st January 1970
 * (UTC).
 *
 * e.g. A Unix timestamp of 1702900314 is equivalent to an ISO 8601 date time
 * stamp of '2023-12-18T11:51:54Z'
 *
 * The timestamps can be of varying lengths depending on the precision:
 *  * 10 digits - seconds
 *  * 13 digits - milliseconds
 *  * 16 digits - microseconds
 *  * 19 digits - nanoseconds
 */
export type UnixTimestampString = string;

/**
 * ISO 8601 day string in format 'yyyy-MM-dd'
 */
export type IsoDayStamp = string;

/**
 * ISO 8601 year string in format 'yyyy'
 */
export type IsoYearStamp = string;

/**
 * Date input from user, before validation
 */
export type DayMonthYearInput = {
  day: string;
  month: string;
  year: string;
};
