import { formatInTimeZone } from 'date-fns-tz';
import { IsoDateTimeStamp } from '../types/date';

export const getNowAsUtcISOString = (): IsoDateTimeStamp =>
  `${formatInTimeZone(new Date(), '+00:00', 'yyyy-MM-dd')}T${formatInTimeZone(new Date(), '+00:00', 'HH:mm:ss.SSS xxxxxx')}`;
