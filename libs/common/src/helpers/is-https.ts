import dotenv from 'dotenv';
import { stringToBoolean } from './string-to-boolean';

dotenv.config();

/**
 * Determines if the current environment is using HTTPS.
 *
 * Checks the `HTTPS` environment variable and returns `true` if it is set,
 * otherwise returns `false`.
 *
 * @returns `true` if HTTPS is enabled, `false` otherwise.
 */
export const isHttps = (): boolean => {
  const { HTTPS } = process.env;

  return stringToBoolean(HTTPS);
};
