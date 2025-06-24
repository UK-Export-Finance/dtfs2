import dotenv from 'dotenv';
import { TIMEZONE } from '../constants/timezone';

dotenv.config();

const { TZ } = process.env;

/**
 * The `timezone` constant determines the application's timezone configuration.
 * It uses the value of the `TZ` environment variable if available; otherwise, it falls back to `TIMEZONE.DEFAULT`.
 *
 * @remarks
 * This is useful for ensuring consistent timezone handling across different environments.
 *
 * @example
 * // If TZ is set to 'Europe/London', timezone will be 'Europe/London'
 * // Otherwise, it will use the default timezone specified in TIMEZONE.DEFAULT
 */
export const timezone = TZ || TIMEZONE.DEFAULT;
