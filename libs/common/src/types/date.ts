import { Prettify } from '.';
import { MonthAndYearPartialEntity } from '../sql-db-entities/partial-entities';

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
export type UnixTimestamp = number;

export type MonthAndYear = Prettify<MonthAndYearPartialEntity>;

/**
 * ISO 8601 date time string in format 'yyyy-MM-ddThh:mm:ssZ'
 */
export type IsoDateTimeStamp = string;
