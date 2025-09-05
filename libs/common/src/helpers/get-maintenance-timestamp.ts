import dotenv from 'dotenv';
import { getLongTimeDateFormat } from './date';

dotenv.config();

/**
 * Returns a formatted date string based on the maintenance timestamp.
 *
 * If the `MAINTENANCE_TIMESTAMP` environment variable is not set,
 * it returns the current date in long time format.
 * Otherwise, it formats the date using the provided timestamp.
 *
 * @returns {string} The formatted date string.
 */
export const getMaintenanceTimestamp = () => {
  const { MAINTENANCE_TIMESTAMP } = process.env;

  return !MAINTENANCE_TIMESTAMP ? getLongTimeDateFormat() : getLongTimeDateFormat(Number(MAINTENANCE_TIMESTAMP));
};
