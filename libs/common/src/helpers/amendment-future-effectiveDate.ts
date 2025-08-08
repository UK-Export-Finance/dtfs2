import { fromUnixTime } from 'date-fns';
import { UnixTimestampSeconds } from '../types/date';
import { now } from './date';
/**
 * Returns a boolean indicating whether the given amendment effective date is in the future.
 * @param date - The effective date of an amendment
 * @returns If the effective date is in the future, returns true; otherwise, false.
 */
export const isFutureEffectiveDate = (date: UnixTimestampSeconds): boolean => new Date(fromUnixTime(date ?? 0)) > now();
