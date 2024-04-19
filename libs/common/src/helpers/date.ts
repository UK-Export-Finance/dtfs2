import { formatInTimeZone } from 'date-fns-tz';

export const getNowAsUtcISOString = () => formatInTimeZone(new Date(), '+00:00', 'yyyy:MM:dd HH:mm:ss.SSS xxxxxx');
